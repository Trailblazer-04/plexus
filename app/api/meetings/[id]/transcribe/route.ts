import { auth } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const run = promisify(execFile);
const MAX_UPLOAD = 24 * 1024 * 1024;
const MAX_RECORDING = 250 * 1024 * 1024;
// Next's server bundler rewrites ffmpeg-static's __dirname to a virtual \ROOT
// path. Resolve the installed binary from the real project runtime directory.
const ffmpegPath = process.env.FFMPEG_BIN || join(
  process.cwd(),
  "node_modules",
  "ffmpeg-static",
  process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg",
);

async function transcribe(audio: Blob, filename: string, language: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const form = new FormData();
    form.append("model", "voxtral-mini-transcribe-3-0");
    form.append("file", audio, filename);
    if (language !== "auto") form.append("language", language);
    form.append("timestamp_granularities[]", "segment");
    form.append("diarize", "true");
    const response = await fetch("https://api.mistral.ai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` },
      body: form,
    });
    const body = await response.json();
    if (response.ok) return NextResponse.json({ text: body.text, language: body.language, segments: body.segments || [] });

    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const waitSeconds = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 20) : 2 ** (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
      continue;
    }

    if (response.status === 429) {
      return NextResponse.json({ error: "Mistral is rate limiting transcription for this workspace. Wait a minute and retry; if it continues, check workspace usage and audio transcription quotas." }, { status: 429 });
    }
    return NextResponse.json({ error: body.message || `Mistral transcription failed (HTTP ${response.status}).` }, { status: response.status });
  }
  return NextResponse.json({ error: "Mistral transcription could not be completed." }, { status: 502 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.MISTRAL_API_KEY) return NextResponse.json({ error: "MISTRAL_API_KEY is not configured." }, { status: 503 });
  const { id } = await params;
  const contentType = req.headers.get("content-type") || "";
  const language = req.headers.get("x-transcription-language") || "auto";
  let stage = "validating the recording request";

  try {
    if (contentType.includes("application/json")) {
      const { recordingUrl, language: selectedLanguage = "auto" } = await req.json() as { recordingUrl?: string; language?: string };
      if (!recordingUrl || !process.env.NEXT_PUBLIC_STREAM_API_KEY || !process.env.STREAM_SECRET_KEY) {
        return NextResponse.json({ error: "Recording or Stream server configuration is missing." }, { status: 400 });
      }

      // Verify both meeting membership and the exact recording URL through Stream before fetching it.
      const stream = new StreamClient(process.env.NEXT_PUBLIC_STREAM_API_KEY, process.env.STREAM_SECRET_KEY);
      const call = stream.video.call("default", id);
      stage = "checking access to the Stream meeting and recording";
      const [callResponse, recordingsResponse] = await Promise.all([call.get(), call.listRecordings()]);
      const isMember = callResponse.members.some((member) => member.user_id === userId)
        || callResponse.call.created_by?.id === userId;
      if (!isMember) return NextResponse.json({ error: "You do not have access to this meeting." }, { status: 403 });
      let requestedRecording: URL;
      try {
        requestedRecording = new URL(recordingUrl);
      } catch {
        return NextResponse.json({ error: "The recording link is invalid." }, { status: 400 });
      }
      // Stream may refresh signed query parameters between the recording list
      // request and transcription. Match the Stream-listed origin/path, then
      // always fetch the current URL returned by Stream itself.
      const recording = recordingsResponse.recordings.find((item) => {
        if (item.url === recordingUrl) return true;
        try {
          const listed = new URL(item.url);
          return listed.origin === requestedRecording.origin && listed.pathname === requestedRecording.pathname;
        } catch {
          return false;
        }
      });
      if (!recording) return NextResponse.json({ error: "Stream has not made this recording available for the meeting yet. Wait a moment, refresh Recordings, then try again." }, { status: 409 });

      stage = "downloading the Stream recording";
      const mediaResponse = await fetch(recording.url, { signal: AbortSignal.timeout(60_000) });
      if (!mediaResponse.ok) return NextResponse.json({ error: `Stream recording download failed (HTTP ${mediaResponse.status}). Refresh Recordings and try again.` }, { status: 502 });
      const declaredSize = Number(mediaResponse.headers.get("content-length") || 0);
      if (declaredSize > MAX_RECORDING) return NextResponse.json({ error: "Recording is too large to transcribe." }, { status: 413 });
      const videoBytes = Buffer.from(await mediaResponse.arrayBuffer());
      if (videoBytes.byteLength > MAX_RECORDING) return NextResponse.json({ error: "Recording is too large to transcribe." }, { status: 413 });
      if (!ffmpegPath) return NextResponse.json({ error: "Audio conversion is unavailable on this server." }, { status: 500 });

      const directory = await mkdtemp(join(tmpdir(), "plexus-transcribe-"));
      try {
        const inputPath = join(directory, "recording.mp4");
        const outputPath = join(directory, "audio.mp3");
        await writeFile(inputPath, videoBytes);
        stage = "extracting audio from the Stream video";
        await run(ffmpegPath, ["-nostdin", "-i", inputPath, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "64k", "-y", outputPath], { timeout: 120_000, windowsHide: true });
        const audioBytes = await readFile(outputPath);
        if (audioBytes.byteLength > MAX_UPLOAD) return NextResponse.json({ error: "Extracted audio is larger than the transcription limit." }, { status: 413 });
        stage = "transcribing extracted audio with Mistral";
        return await transcribe(new Blob([audioBytes], { type: "audio/mpeg" }), "meeting-audio.mp3", selectedLanguage);
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    }

    const input = await req.formData();
    const file = input.get("file");
    const selectedLanguage = String(input.get("language") || language);
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an audio recording first." }, { status: 400 });
    if (file.size > MAX_UPLOAD) return NextResponse.json({ error: "Audio file must be smaller than 24 MB." }, { status: 413 });
    stage = "transcribing uploaded audio with Mistral";
    return await transcribe(file, file.name, selectedLanguage);
  } catch (error) {
    console.error("Transcription request failed", error);
    return NextResponse.json({ error: `${stage}: ${error instanceof Error ? error.message : "unknown server error"}` }, { status: 502 });
  }
}

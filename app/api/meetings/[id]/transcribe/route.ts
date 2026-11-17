import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.MISTRAL_API_KEY) return NextResponse.json({ error: "MISTRAL_API_KEY is not configured." }, { status: 503 });
  const input = await req.formData();
  const file = input.get("file");
  const language = String(input.get("language") || "auto");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an audio recording first." }, { status: 400 });
  if (file.size > 24 * 1024 * 1024) return NextResponse.json({ error: "Audio must be smaller than 24 MB." }, { status: 413 });
  try {
    const form = new FormData();
    form.append("model", "voxtral-mini-transcribe-3-0");
    form.append("file", file, file.name);
    if (language !== "auto") form.append("language", language);
    form.append("timestamp_granularities[]", "segment");
    form.append("diarize", "true");
    const response = await fetch("https://api.mistral.ai/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` }, body: form });
    const body = await response.json();
    if (!response.ok) return NextResponse.json({ error: body.message || "Mistral transcription failed." }, { status: response.status });
    return NextResponse.json({ text: body.text, language: body.language, segments: body.segments || [] });
  } catch {
    return NextResponse.json({ error: "Transcription request failed." }, { status: 502 });
  }
}

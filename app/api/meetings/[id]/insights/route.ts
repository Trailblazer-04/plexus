import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/mongodb";
import { meetingModel, meetingVectorStore, transcriptDocuments } from "@/lib/meeting-ai";

const schema = z.object({ transcript: z.string().min(20).max(100_000), language: z.string().max(40).optional() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Add a transcript with at least 20 characters." }, { status: 400 });
  try {
    const { transcript, language } = parsed.data;
    const response = await meetingModel().invoke([
      ["system", "Analyze this meeting transcript. Return valid JSON only with summary (string), keyPoints (string array), actionItems (array of {task, owner, dueDate}; unknown values must be null). Do not invent facts."],
      ["human", `Language: ${language || "auto-detect"}\nTranscript:\n${transcript}`],
    ]);
    const raw = typeof response.content === "string" ? response.content : response.content.map((part) => "text" in part ? part.text : "").join("");
    const insights = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "")) as { summary: string; keyPoints: string[]; actionItems: { task: string; owner: string | null; dueDate: string | null }[] };
    const db = await getDatabase();
    const now = new Date();
    await db.collection("meeting_insights").updateOne({ meetingId: id, ownerId: userId }, { $set: { meetingId: id, ownerId: userId, transcript, language: language || "auto", ...insights, updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true });
    await db.collection("transcript_chunks").deleteMany({ meetingId: id, ownerId: userId });
    const docs = transcriptDocuments(transcript, id, userId);
    if (docs.length) await (await meetingVectorStore()).addDocuments(docs);
    return NextResponse.json({ ...insights, language: language || "auto", updatedAt: now.toISOString() });
  } catch (error) {
    console.error("Insight generation failed", error);
    return NextResponse.json({ error: "Could not generate insights. Check Mistral and MongoDB configuration." }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const insight = await (await getDatabase()).collection("meeting_insights").findOne({ meetingId: id, ownerId: userId }, { projection: { _id: 0 } });
    return NextResponse.json({ insight });
  } catch {
    return NextResponse.json({ error: "Could not load insights." }, { status: 500 });
  }
}

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { meetingModel, meetingVectorStore } from "@/lib/meeting-ai";

const schema = z.object({ question: z.string().min(2).max(1000) });
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a question." }, { status: 400 });
  try {
    const docs = await (await meetingVectorStore()).similaritySearch(parsed.data.question, 5, { ownerId: userId, meetingId: id });
    if (!docs.length) return NextResponse.json({ answer: "There’s no transcript for this meeting yet. Add one in Meeting notes first." });
    const result = await meetingModel().invoke([["system", "Answer only from the supplied meeting transcript. If the answer is absent, say so. Be concise."], ["human", `Question: ${parsed.data.question}\n\nTranscript excerpts:\n${docs.map((d) => d.pageContent).join("\n\n")}`]]);
    return NextResponse.json({ answer: typeof result.content === "string" ? result.content : result.content.map((p) => "text" in p ? p.text : "").join("") });
  } catch (error) {
    console.error("Meeting search failed", error);
    return NextResponse.json({ error: "Could not search this transcript. Check Mistral and MongoDB configuration." }, { status: 500 });
  }
}

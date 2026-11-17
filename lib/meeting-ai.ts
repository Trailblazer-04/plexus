import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { ChatMistralAI, MistralAIEmbeddings } from "@langchain/mistralai";
import { getDatabase } from "@/lib/mongodb";

function apiKey() {
  if (!process.env.MISTRAL_API_KEY) throw new Error("MISTRAL_API_KEY is not configured");
  return process.env.MISTRAL_API_KEY;
}

export const meetingModel = () => new ChatMistralAI({ apiKey: apiKey(), model: process.env.MISTRAL_MODEL || "mistral-small-latest", temperature: 0.2 }) as unknown as {
  invoke(messages: ["system" | "human", string][]): Promise<{ content: string | { text?: string }[] }>;
};

export async function meetingVectorStore() {
  const db = await getDatabase();
  return new MongoDBAtlasVectorSearch(new MistralAIEmbeddings({ apiKey: apiKey(), model: "mistral-embed" }), {
    // LangChain currently bundles a distinct MongoDB type version; runtime collection API is compatible.
    collection: db.collection("transcript_chunks") as never,
    indexName: process.env.MONGODB_VECTOR_INDEX || "plexus_transcript_vector_index",
    textKey: "text",
    embeddingKey: "embedding",
  });
}

export function transcriptDocuments(text: string, meetingId: string, ownerId: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  const docs: { pageContent: string; metadata: Record<string, string | number> }[] = [];
  for (let i = 0; i < clean.length; i += 920) {
    const chunk = clean.slice(i, i + 1100);
    if (chunk) docs.push({ pageContent: chunk, metadata: { meetingId, ownerId, source: "transcript", offset: i } });
  }
  return docs;
}

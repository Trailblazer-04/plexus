"use client";

import { useEffect, useState } from "react";
import { Bot, Check, FileAudio, LoaderCircle, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Insight = { summary: string; keyPoints: string[]; actionItems: { task: string; owner: string | null; dueDate: string | null }[]; transcript: string; language: string };

export default function MeetingInsights({ meetingId }: { meetingId: string }) {
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("auto");
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    fetch(`/api/meetings/${encodeURIComponent(meetingId)}/insights`).then((r) => r.ok ? r.json() : null).then((data) => {
      if (data?.insight) { setInsight(data.insight); setTranscript(data.insight.transcript); setLanguage(data.insight.language || "auto"); }
    }).catch(() => undefined);
  }, [meetingId]);

  const transcribe = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData(); form.append("file", file); form.append("language", language);
      const response = await fetch(`/api/meetings/${encodeURIComponent(meetingId)}/transcribe`, { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Transcription failed");
      setTranscript(data.text); setLanguage(data.language || language); toast.success("Transcript ready");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Transcription failed"); }
    finally { setLoading(false); }
  };

  const generate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/meetings/${encodeURIComponent(meetingId)}/insights`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript, language }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not analyze transcript");
      setInsight({ ...data, transcript }); toast.success("Meeting insights saved");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not analyze transcript"); }
    finally { setLoading(false); }
  };

  const ask = async (event: React.FormEvent) => {
    event.preventDefault(); if (!question.trim()) return;
    setAsking(true); setAnswer("");
    try {
      const response = await fetch(`/api/meetings/${encodeURIComponent(meetingId)}/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Search failed"); setAnswer(data.answer);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Search failed"); }
    finally { setAsking(false); }
  };

  return <aside className="flex h-full min-h-0 flex-col border-l border-white/[0.07] bg-[#0c1019] text-white">
    <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4"><div className="grid size-9 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><Sparkles size={17}/></div><div><h2 className="text-sm font-semibold">Meeting intelligence</h2><p className="text-xs text-white/40">Transcript, notes & AI</p></div></div>
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
      <section className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Transcript</h3><select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-lg border border-white/10 bg-[#141a25] px-2 py-1.5 text-xs text-white/80" aria-label="Transcription language"><option value="auto">Auto detect</option><option value="en">English</option><option value="hi">Hindi</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option><option value="pt">Portuguese</option><option value="ja">Japanese</option><option value="zh">Chinese</option></select></div>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-3 text-xs text-white/65 transition hover:border-violet-400/50 hover:bg-violet-400/[0.05]"><FileAudio size={15}/>{loading ? "Working…" : "Upload audio to transcribe"}<input type="file" accept="audio/*,.mp3,.wav,.webm,.m4a,.ogg" className="sr-only" onChange={(e) => void transcribe(e.target.files?.[0])}/></label>
        <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste a transcript here, or upload an audio recording…" className="min-h-28 w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs leading-5 text-white/80 outline-none placeholder:text-white/25 focus:border-violet-400/40" />
        <button onClick={() => void generate()} disabled={loading || transcript.trim().length < 20} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40">{loading ? <LoaderCircle size={15} className="animate-spin"/> : <Bot size={15}/>}Generate summary & action items</button>
      </section>
      {insight && <>
        <section className="space-y-2"><h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50"><Sparkles size={13}/>Summary</h3><p className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-xs leading-5 text-white/75">{insight.summary}</p></section>
        {insight.keyPoints?.length > 0 && <section className="space-y-2"><h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Key points</h3><ul className="space-y-2">{insight.keyPoints.map((point, i) => <li key={i} className="flex gap-2 text-xs leading-5 text-white/70"><span className="mt-2 size-1 shrink-0 rounded-full bg-violet-400"/>{point}</li>)}</ul></section>}
        <section className="space-y-2"><h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Action items</h3>{insight.actionItems?.length ? insight.actionItems.map((item, i) => <div key={i} className="flex gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><Check size={14} className="mt-0.5 shrink-0 text-emerald-400"/><div className="text-xs leading-5 text-white/75">{item.task}<p className="mt-1 text-[10px] text-white/35">{[item.owner, item.dueDate].filter(Boolean).join(" · ") || "Owner and date not specified"}</p></div></div>) : <p className="text-xs text-white/40">No action items identified.</p>}</section>
        <section className="space-y-2"><h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50"><MessageCircle size={13}/>Ask this meeting</h3><form onSubmit={ask} className="flex gap-2"><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What did we decide about…?" className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white outline-none placeholder:text-white/30"/><button disabled={asking} className="rounded-xl bg-white/10 px-3 text-xs text-white/80 hover:bg-white/15 disabled:opacity-50">{asking ? "…" : "Ask"}</button></form>{answer && <p className="rounded-xl bg-violet-400/[0.08] p-3 text-xs leading-5 text-white/75">{answer}</p>}</section>
      </>}
    </div>
  </aside>;
}

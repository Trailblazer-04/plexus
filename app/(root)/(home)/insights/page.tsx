import CallList from "@/components/callList";
import Link from "next/link";

export default function MeetingInsightsPage() {
  return <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-8 text-white">
    <header className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Plexus AI</p>
      <h1 className="mt-2 text-3xl font-bold">Meeting intelligence</h1>
      <p className="mt-2 text-sm leading-6 text-white/45">Record calls from the meeting toolbar. After the call, open a past meeting to add its audio or transcript and generate a searchable summary and action items.</p>
      <Link href="/recordings" className="mt-4 inline-flex rounded-lg border border-white/10 px-3 py-2 text-sm text-white/75 transition hover:bg-white/5">Browse cloud recordings</Link>
    </header>
    <CallList type="ended" />
  </section>;
}

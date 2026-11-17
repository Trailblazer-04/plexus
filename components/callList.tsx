"use client";

import { Call, CallRecording } from "@stream-io/video-react-sdk";

import Loader from "./Loader";
import { useGetCalls } from "@/hooks/useGetCalls";
import MeetingCard from "./MeetingCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const recordingCache = new Map<string, Promise<CallRecording[]>>();

async function recordingsFor(meeting: Call): Promise<CallRecording[]> {
  const key = `${meeting.type}:${meeting.id}`;
  let request = recordingCache.get(key);
  if (!request) {
    request = meeting.listRecordings().then((result) => result.recordings).catch(() => []);
    recordingCache.set(key, request);
  }
  return request;
}

const CallList = ({ type }: { type: "ended" | "upcoming" | "recordings" }) => {
  const router = useRouter();
  const { endedCalls, upcomingCalls, callRecordings, isLoading } =
    useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);

  const getCalls = () => {
    switch (type) {
      case "ended":
        return endedCalls;
      case "recordings":
        return recordings;
      case "upcoming":
        return upcomingCalls;
      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case "ended":
        return "No Previous Calls";
      case "upcoming":
        return "No Upcoming Calls";
      case "recordings":
        return "No Recordings";
      default:
        return "";
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchRecordings = async () => {
      setIsLoadingRecordings(true);
      const results: CallRecording[] = [];
      // Recording lookup is a per-call endpoint; serialize and cap requests to avoid Stream 429s.
      for (const meeting of [...endedCalls].slice(0, 8)) {
        const items = await recordingsFor(meeting);
        results.push(...items);
        if (cancelled) return;
      }
      if (!cancelled) setRecordings(results);
      if (!cancelled) setIsLoadingRecordings(false);
    };

    if (type === "recordings") {
      void fetchRecordings();
    }
    return () => { cancelled = true; };
  }, [type, endedCalls]);

  if (isLoading || (type === "recordings" && isLoadingRecordings)) return <Loader />;

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording, index: number) => (
          <MeetingCard
            key={type === "recordings" ? (meeting as CallRecording).url || `${(meeting as CallRecording).filename}-${index}` : (meeting as Call).id}
            icon={
              type === "ended"
                ? "/icons/previous.svg"
                : type === "upcoming"
                  ? "/icons/upcoming.svg"
                  : "/icons/recordings.svg"
            }
            title={
              (meeting as Call).state?.custom?.description ||
              (meeting as CallRecording).filename?.substring(0, 20) ||
              "No Description"
            }
            date={
              (meeting as Call).state?.startsAt?.toLocaleString() ||
              (meeting as CallRecording).start_time?.toLocaleString()
            }
            isPreviousMeeting={type === "ended"}
            link={
              type === "recordings"
                ? (meeting as CallRecording).url
                : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`
            }
            insightLink={type === "ended" ? `/meeting/${(meeting as Call).id}?insights=true` : undefined}
            buttonIcon1={type === "recordings" ? "/icons/play.svg" : undefined}
            buttonText={type === "recordings" ? "Play" : "Start"}
            handleClick={
              type === "recordings"
                ? () => router.push(`${(meeting as CallRecording).url}`)
                : () => router.push(`/meeting/${(meeting as Call).id}`)
            }
          />
        ))
      ) : (
        <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
      )}
    </div>
  );
};

export default CallList;

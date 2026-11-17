"use client";

import React, { use, useState } from "react";
import { useUser } from "@clerk/nextjs";

import {
  StreamCall,
  StreamTheme,
} from "@stream-io/video-react-sdk";

import MeetingSetup from "@/components/MeetingSetup";
import MeetingRoom from "@/components/MeetingRoom";
import Loader from "@/components/Loader";

import { useGetCallById } from "@/hooks/useGetCallById";
import { useSearchParams } from "next/navigation";
import MeetingInsights from "@/components/MeetingInsights";

const Meeting = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = use(params);
  const searchParams = useSearchParams();

  const { isLoaded } = useUser();

  const [isSetupComplete, setIsSetupComplete] =
    useState(false);

  const { call, isCallLoading } = useGetCallById(id);

  if (searchParams.get("insights") === "true") {
    return <main className="min-h-screen bg-[#080b12] p-4 text-white md:p-8"><div className="mx-auto h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-2xl border border-white/10"><MeetingInsights meetingId={id}/></div></main>;
  }

  if (!isLoaded || isCallLoading || !call) {
    return <Loader />;
  }

  return (
    <main className="h-screen w-full overflow-hidden">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup
              setIsSetupComplete={setIsSetupComplete}
            />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default Meeting;

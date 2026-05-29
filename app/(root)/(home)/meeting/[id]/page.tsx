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

const Meeting = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = use(params);

  const { isLoaded } = useUser();

  const [isSetupComplete, setIsSetupComplete] =
    useState(false);

  const { call, isCallLoading } = useGetCallById(id);

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
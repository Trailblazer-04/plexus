"use client";

import React, { useEffect, useState } from "react";

import {
  DeviceSettings,
  useCall,
  VideoPreview,
} from "@stream-io/video-react-sdk";

import { Button } from "./ui/button";

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const [isMicCamOff, setIsMicCamOff] =
    useState(false);

  const call = useCall();

  useEffect(() => {
    if (!call) return;

    if (isMicCamOff) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamOff, call]);

  if (!call) {
    return null;
  }

  const handleJoin = async () => {
    await call.join();

    setIsSetupComplete(true);
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-dark-1 text-white">
      <h1 className="text-2xl font-bold">
        Setup
      </h1>

      <VideoPreview />

      <div className="flex flex-col items-center gap-4">
        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={isMicCamOff}
            onChange={(e) =>
              setIsMicCamOff(e.target.checked)
            }
          />

          Join with mic and camera off
        </label>

        <DeviceSettings />
      </div>

      <Button
        className="rounded-md bg-green-500 px-6 py-2.5 hover:bg-green-600"
        onClick={handleJoin}
      >
        Join Meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;
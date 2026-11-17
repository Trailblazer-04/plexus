import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
  RecordCallButton,
} from "@stream-io/video-react-sdk";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import React, { useState } from "react";
import { LayoutList, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import EndCallButton from "./EndCallButton";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const call = useCall();
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal')
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;

      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;

      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative flex h-screen w-full overflow-hidden bg-[#080b12] pt-4 text-white">
      {callingState !== CallingState.JOINED && <div className="absolute left-1/2 top-5 z-50 -translate-x-1/2 rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-xs text-amber-100 shadow-lg">{callingState === CallingState.RECONNECTING || callingState === CallingState.MIGRATING ? "Reconnecting to your meeting…" : callingState === CallingState.RECONNECTING_FAILED ? "Connection lost. Check your network and rejoin." : "Meeting connection updating…"}</div>}
      <div className="relative flex min-w-0 flex-1 items-center justify-center px-3 pb-24">
        <div className="flex size-full max-w-250 items-center">
          <CallLayout />
        </div>

      </div>

      <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-[#111722]/95 px-3 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl sm:gap-3 sm:px-4">
        <CallControls />
        <RecordCallButton />
        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232D] px-4 py-2 
            hover:bg-[#4C535B]">
                <LayoutList size={20} className="text-white"/>
            </DropdownMenuTrigger>
          </div>

          <DropdownMenuContent className="border-[#1C1C1C] bg-[#1C1C1C]">
             {['Grid', 'speaker-left', 'speaker-right'].map((item, index) => (
                <div key={index}>
                    <DropdownMenuItem className="cursor-pointer" 
                    onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}>
                       {item}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="border-[#1C1C1C]"/>
                </div>
             ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton/>
        <button aria-label="Toggle participants" onClick={() => setShowParticipants((prev) => !prev)}>
            <div className="cursor-pointer rounded-2xl bg-[#19232D] px-4 py-2 
            hover:bg-[#4C535B]">
                <Users size={20} className="text-white"/>
            </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
      {showParticipants && <div className="absolute right-4 top-5 z-30 h-[calc(100%-112px)] w-72 rounded-2xl border border-white/10 bg-[#10151f] p-2 shadow-2xl md:right-[380px]"><CallParticipantsList onClose={() => setShowParticipants(false)}/></div>}
    </section>
  );
};

export default MeetingRoom;

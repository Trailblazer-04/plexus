"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import HomeCard from "./HomeCard";
import MeetingModal from "./MeetingModal";
import Loader from "./Loader";

import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import { Textarea } from "./ui/textarea";

import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { toast } from "sonner";

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
};

type Variant = "orange" | "blue" | "purple" | "yellow";

const CARDS: {
  img: string;
  title: string;
  description: string;
  state: "isInstantMeeting" | "isJoiningMeeting" | "isScheduleMeeting" | null;
  variant: Variant;
}[] = [
  {
    img: "/icons/add-meeting.svg",
    title: "New Meeting",
    description: "Start an instant meeting",
    state: "isInstantMeeting",
    variant: "orange",
  },
  {
    img: "/icons/join-meeting.svg",
    title: "Join Meeting",
    description: "Via invitation link",
    state: "isJoiningMeeting",
    variant: "blue",
  },
  {
    img: "/icons/schedule.svg",
    title: "Schedule",
    description: "Plan your meeting",
    state: "isScheduleMeeting",
    variant: "purple",
  },
  {
    img: "/icons/recordings.svg",
    title: "Recordings",
    description: "View past meetings",
    state: null,
    variant: "yellow",
  },
];

const MeetingTypeList = () => {
  const router = useRouter();

  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >(undefined);

  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();

  const client = useStreamVideoClient();
  const { user } = useUser();

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast.error("Please select a date and time");
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create meeting");

      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "Instant Meeting";

      await call.getOrCreate({
        data: { starts_at: startsAt, custom: { description } },
      });

      setCallDetail(call);

      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }

      toast.success("Meeting created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create meeting");
    }
  };

  if (!client || !user) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/25">
            Quick actions
          </p>
          <h2 className="mt-0.5 text-lg font-bold text-white/90">
            Manage meetings
          </h2>
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          {["bg-orange-400", "bg-blue-400", "bg-purple-400", "bg-yellow-400"].map((c, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full opacity-40 ${c}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {CARDS.map((card) => (
          <HomeCard
            key={card.title}
            img={card.img}
            title={card.title}
            description={card.description}
            variant={card.variant}
            handleClick={() => {
              if (card.state) {
                setMeetingState(card.state);
              } else {
                router.push("/recordings");
              }
            }}
          />
        ))}
      </div>

      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Schedule a meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Description
            </label>
            <Textarea
              className="border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:ring-offset-0"
              placeholder="What's this meeting about?"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Date & Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date: Date | null) =>
                setValues({ ...values, dateTime: date || new Date() })
              }
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Meeting scheduled"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast.success("Link copied");
          }}
          image="/icons/checked.svg"
          buttonIcon="/icons/copy.svg"
          className="text-center"
          buttonText="Copy meeting link"
        />
      )}

      <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Join via link"
        className="text-center"
        buttonText="Join meeting"
        handleClick={() => router.push(values.link)}
      >
        <input
          type="text"
          placeholder="Paste meeting link here"
          value={values.link}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setValues({ ...values, link: e.target.value })
          }
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-blue-500/50"
        />
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start instant meeting"
        className="text-center"
        buttonText="Start now"
        handleClick={createMeeting}
      />
    </div>
  );
};

export default MeetingTypeList;
"use client";

import { useEffect, useState, ReactNode } from "react";
import {
  Call,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import { tokenProvider } from "@/actions/stream.actions";
import Loader from "@/components/Loader";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export const StreamVideoProvider = ({children} : {children : ReactNode}) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const {user, isLoaded} = useUser();

  useEffect (() => {
     if(!isLoaded || !user) return;
     if(!apiKey) throw new Error('Stream API key missing')

     const client = new StreamVideoClient({
        apiKey,
        user: {
            id: user?.id,
            name: user?.username || user?.id,
            image: user?.imageUrl,
        }, 
        tokenProvider,
     })

     setVideoClient(client);

  }, [user, isLoaded]);

  if(!videoClient) return <Loader/>

  return (
    <StreamVideo client = {videoClient}>
        {children}
    </StreamVideo>
  )
};

const MyCallUI = ({ client }: { client: StreamVideoClient }) => {
  const [call, setCall] = useState<Call>();

  useEffect(() => {
    const myCall = client.call("default", "my-first-call");
    myCall.join({ create: true }).catch(console.error);
    setCall(myCall);

    return () => {
      myCall.leave().catch(console.error);
      setCall(undefined);
    };
  }, [client]);

  if (!call) return null;

  return <StreamCall call={call}>{/* <MyVideoUI /> */}</StreamCall>;
};
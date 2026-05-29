"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";

import { useUser } from "@clerk/nextjs";

import Loader from "@/components/Loader";

const apiKey =
  process.env.NEXT_PUBLIC_STREAM_API_KEY!;

const StreamVideoProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, isLoaded } = useUser();

  const [videoClient, setVideoClient] =
    useState<StreamVideoClient>();

  useEffect(() => {
    if (!isLoaded || !user) return;

    if (!apiKey) {
      throw new Error(
        "NEXT_PUBLIC_STREAM_API_KEY is missing"
      );
    }

    const client = new StreamVideoClient({
      apiKey,

      user: {
        id: user.id,
        name: user.username || user.id,
        image: user.imageUrl,
      },

      tokenProvider: async () => {
        const response = await fetch(
          "/api/stream-token"
        );

        const data = await response.json();

        return data.token;
      },
    });

    setVideoClient(client);

    return () => {
      client.disconnectUser();
      setVideoClient(undefined);
    };
  }, [user, isLoaded]);

  if (!videoClient) return <Loader />;

  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
};

export default StreamVideoProvider;
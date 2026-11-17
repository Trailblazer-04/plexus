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

    const client = StreamVideoClient.getOrCreateInstance({
      apiKey,

      user: {
        id: user.id,
        name: user.username || user.id,
        image: user.imageUrl,
      },

      tokenProvider: async () => {
        const response = await fetch("/api/stream-token", {
          cache: "no-store",
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch Stream token: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        if (!data.token) {
          throw new Error("Stream token not returned from server");
        }

        return data.token;
      },
    });

    setVideoClient(client);

    // Keep the user-scoped SDK singleton alive across React Strict Mode effect
    // replay and route transitions. Disconnecting here races the next mount,
    // causing a second client and a dropped call connection.
  }, [user, isLoaded]);

  if (!isLoaded) return <Loader />;

  if (!user) return <>{children}</>;

  if (!videoClient) return <Loader />;

  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
};

export default StreamVideoProvider;

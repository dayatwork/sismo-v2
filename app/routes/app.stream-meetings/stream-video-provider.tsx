import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

import { useLoggedInUser } from "~/utils/auth";

export function StreamVideoProvider({
  children,
  apiKey,
  token,
}: {
  children: React.ReactNode;
  apiKey: string;
  token: string;
}) {
  const user = useLoggedInUser();
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();

  useEffect(() => {
    if (!user) return;

    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: user.id,
        name: user.name,
        image: user.photo || "https://i.pravatar.cc/300",
      },
      token,
    });

    setVideoClient(client);
  }, [user, apiKey, token]);

  if (!videoClient) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <Loader className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}

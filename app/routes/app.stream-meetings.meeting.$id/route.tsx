import { Link, useParams } from "@remix-run/react";
import { useLoggedInUser } from "~/utils/auth";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useGetCallById } from "~/hooks/useGetCallById";
import { useState } from "react";
import { MeetingSetup } from "./meeting-setup";
import MeetingRoom from "./meeting-room";
import { ArrowLeft, Loader } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";

export default function StreamMeetingRoom() {
  const { id } = useParams<{ id: string }>();
  const user = useLoggedInUser();
  const { call, isCallLoading } = useGetCallById(id!);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (isCallLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <Loader className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex-1 h-screen flex items-center flex-col justify-center gap-4">
        <p className="text-2xl font-semibold">Call not found</p>
        <Link
          to="/app/stream-meetings"
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
      </div>
    );
  }

  const notAllowed =
    call.type === "invited" &&
    (!user || !call.state.members.find((m) => m.user.id === user.id));

  if (notAllowed) {
    return (
      <div className="flex-1 h-screen flex items-center flex-col justify-center gap-4">
        <p className="text-2xl font-semibold">
          You are not allowed to join this meeting!
        </p>
        <Link
          to="/app/stream-meetings"
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
}

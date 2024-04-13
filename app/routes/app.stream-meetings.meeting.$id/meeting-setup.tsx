import { useEffect, useState } from "react";
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import { Button, buttonVariants } from "~/components/ui/button";
import { Link } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";

export function MeetingSetup({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;
  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  const call = useCall();

  if (!call) {
    throw new Error("useStreamCall must be used within a StreamCall component");
  }

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  if (callTimeNotArrived) {
    return (
      <div className="flex-1 h-screen flex items-center flex-col justify-center gap-4">
        <p className="text-2xl font-semibold">
          Your meeting has not started yet. It is scheduled for{" "}
          {callStartsAt.toLocaleString()}
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

  if (callHasEnded) {
    return (
      <div className="flex-1 h-screen flex items-center flex-col justify-center gap-4">
        <p className="text-2xl font-semibold">
          The call has been ended by the host
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
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-center text-2xl font-bold">Setup</h1>
      <VideoPreview />
      <div className="flex h-16 items-center justify-center gap-3">
        <label className="flex items-center justify-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={isMicCamToggled}
            onChange={(e) => setIsMicCamToggled(e.target.checked)}
          />
          Join with mic and camera off
        </label>
        <DeviceSettings />
      </div>
      <Button
        className="rounded-md bg-green-500 px-4 py-2.5"
        onClick={() => {
          call.join();

          setIsSetupComplete(true);
        }}
      >
        Join meeting
      </Button>
    </div>
  );
}

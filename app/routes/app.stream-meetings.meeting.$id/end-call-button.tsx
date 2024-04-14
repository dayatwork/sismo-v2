// import { useNavigate } from "@remix-run/react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";

import { Button } from "~/components/ui/button";

const EndCallButton = () => {
  const call = useCall();
  // const navigate = useNavigate();

  if (!call)
    throw new Error(
      "useStreamCall must be used within a StreamCall component."
    );

  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#participant-state-3
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    await call.endCall();
    window.location.href = `${
      import.meta.env.VITE_APP_URL
    }/app/stream-meetings`;
    // navigate("/app/stream-meetings");
  };

  console.log({ env: import.meta.env });

  return (
    <Button onClick={endCall} className="bg-red-500">
      End call for everyone
    </Button>
  );
};

export default EndCallButton;

import { lazy } from "react";
import { ClientOnly } from "remix-utils/client-only";

let LazyImported = lazy(() =>
  import("@jitsi/react-sdk").then((module) => ({
    default: module.JitsiMeeting,
  }))
);

interface Props {
  domain: string;
  roomName: string;
  onClose: () => void;
  userInfo: {
    displayName: string;
    email: string;
  };
}

export default function Meeting({
  domain,
  roomName,
  onClose,
  userInfo,
}: Props) {
  return (
    <ClientOnly>
      {() => (
        <LazyImported
          domain={domain}
          roomName={roomName}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = "100%";
          }}
          onReadyToClose={onClose}
          userInfo={userInfo}
          configOverwrite={{ startWithAudioMuted: true }}
        />
      )}
    </ClientOnly>
  );
}

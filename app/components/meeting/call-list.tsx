import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { Call, CallRecording } from "@stream-io/video-react-sdk";

import { useGetCalls } from "~/hooks/useGetCalls";
import MeetingCard from "./meeting-card";
import { Loader } from "lucide-react";

const CallList = ({ type }: { type: "ended" | "upcoming" | "recordings" }) => {
  const navigate = useNavigate();
  const { endedCalls, upcomingCalls, callRecordings, isLoading } =
    useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  const getCalls = () => {
    switch (type) {
      case "ended":
        return endedCalls;
      case "recordings":
        return recordings;
      case "upcoming":
        return upcomingCalls;
      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case "ended":
        return "No Previous Calls";
      case "upcoming":
        return "No Upcoming Calls";
      case "recordings":
        return "No Recordings";
      default:
        return "";
    }
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      const callData = await Promise.all(
        callRecordings?.map((meeting) => meeting.queryRecordings()) ?? []
      );

      const recordings = callData
        .filter((call) => call.recordings.length > 0)
        .flatMap((call) => call.recordings);

      setRecordings(recordings);
    };

    if (type === "recordings") {
      fetchRecordings();
    }
  }, [type, callRecordings]);

  if (isLoading)
    return (
      <div className="flex-1 flex items-center justify-center h-80">
        <Loader className="w-12 h-12 animate-spin" />
      </div>
    );

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording) => (
          <MeetingCard
            key={(meeting as Call).id}
            icon={
              type === "ended"
                ? "/icons/previous.svg"
                : type === "upcoming"
                ? "/icons/upcoming.svg"
                : "/icons/recordings.svg"
            }
            title={
              (meeting as Call).state?.custom?.description ||
              (meeting as CallRecording).filename?.substring(0, 20) ||
              "No Description"
            }
            date={
              (meeting as Call).state?.startsAt?.toLocaleString() ||
              (meeting as CallRecording).start_time?.toLocaleString()
            }
            isPreviousMeeting={type === "ended"}
            isRecording={type === "recordings"}
            link={
              type === "recordings"
                ? (meeting as CallRecording).url
                : `${import.meta.env.BASE_URL}/app/stream-meetings/meeting/${
                    (meeting as Call).id
                  }`
            }
            buttonIcon1={type === "recordings" ? "/icons/play.svg" : undefined}
            buttonText={type === "recordings" ? "Play" : "Start"}
            handleClick={
              type === "recordings"
                ? () =>
                    window.open(`${(meeting as CallRecording).url}`, "_blank")
                : // window.location.replace(`${(meeting as CallRecording).url}`)
                  () =>
                    navigate(
                      `/app/stream-meetings/meeting/${(meeting as Call).id}`
                    )
            }
          />
        ))
      ) : (
        <h1 className="text-muted-foreground font-semibold">
          {noCallsMessage}
        </h1>
      )}
    </div>
  );
};

export default CallList;

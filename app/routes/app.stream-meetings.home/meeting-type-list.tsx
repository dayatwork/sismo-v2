import { useState } from "react";
import { type Call, useStreamVideoClient } from "@stream-io/video-react-sdk";

import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import HomeCard from "./home-card";
import MeetingModal from "./meeting-modal";
import { useNavigate } from "@remix-run/react";
import { useLoggedInUser } from "~/utils/auth";
import toast from "react-hot-toast";
import { RADatePicker } from "~/components/ui/react-aria/datepicker";
import { parseAbsoluteToLocal } from "@internationalized/date";
import { Loader } from "lucide-react";

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
};

const MeetingTypeList = () => {
  const navigate = useNavigate();
  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const user = useLoggedInUser();

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
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetail(call);
      if (!values.description) {
        navigate(`/app/stream-meetings/meeting/${call.id}`);
      }
      toast.success("Meeting Created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create Meeting");
    }
  };

  if (!client || !user)
    return (
      <div className="flex-1 flex items-center justify-center h-60">
        <Loader className="w-12 h-12 animate-spin" />
      </div>
    );

  const meetingLink = `http://localhost:5173/app/stream-meetings/meeting/${callDetail?.id}`;

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState("isInstantMeeting")}
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        className="bg-blue-600 hover:bg-blue-600/80"
        handleClick={() => setMeetingState("isJoiningMeeting")}
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        className="bg-purple-600 hover:bg-purple-600/80"
        handleClick={() => setMeetingState("isScheduleMeeting")}
      />
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Meeting Recordings"
        className="bg-yellow-600 hover:bg-yellow-600/80"
        handleClick={() => navigate("/app/stream-meetings/recordings")}
      />

      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Add a description
            </label>
            <Textarea
              className="focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Select Date and Time
            </label>
            <RADatePicker
              // defaultValue={parseDate(values.dateTime.toISOString())}
              defaultValue={
                values.dateTime
                  ? parseAbsoluteToLocal(values.dateTime.toISOString())
                  : undefined
              }
              onChange={(date) =>
                setValues({ ...values, dateTime: date.toDate() })
              }
            />
            {/* <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded p-2 focus:outline-none"
            /> */}
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast.success("Link Copied");
          }}
          image={"/icons/checked.svg"}
          buttonIcon="/icons/copy.svg"
          className="text-center"
          buttonText="Copy Meeting Link"
        />
      )}

      <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => navigate(values.link)}
      >
        <Input
          placeholder="Meeting link"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;

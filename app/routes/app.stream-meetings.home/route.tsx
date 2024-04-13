import MainContainer from "~/components/main-container";
import MeetingTypeList from "./meeting-type-list";

export default function StreamMeetingHome() {
  return (
    <MainContainer>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Meetings</h1>
      <MeetingTypeList />
    </MainContainer>
  );
}

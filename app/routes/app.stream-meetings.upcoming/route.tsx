import MainContainer from "~/components/main-container";
import CallList from "~/components/meeting/call-list";

export default function UpcomingMeetings() {
  return (
    <MainContainer>
      <h1 className="text-2xl font-bold tracking-tight mb-8">
        Upcoming Meetings
      </h1>
      <CallList type="upcoming" />
    </MainContainer>
  );
}

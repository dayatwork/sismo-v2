import MainContainer from "~/components/main-container";
import CallList from "~/components/meeting/call-list";

export default function Recordings() {
  return (
    <MainContainer>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Recordings</h1>
      <CallList type="recordings" />
    </MainContainer>
  );
}

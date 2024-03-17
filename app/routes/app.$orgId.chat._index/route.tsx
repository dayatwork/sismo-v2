export default function NoChatSelected() {
  return (
    <div className="flex flex-col items-center gap-10 justify-center h-[calc(100vh-64px)]">
      <img src="/conversation.svg" alt="no data" className="h-1/4" />
      <p className="text-muted-foreground">
        No conversations selected. Select a conversation to start a chat!
      </p>
    </div>
  );
}

import type PusherClient from "pusher-js";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type Props = {
  contactUser: {
    id: string;
    name: string;
    photo: string | null;
  };
  pusherClient: PusherClient;
  organizationId?: string;
  loggedInUserId?: string;
  conversationId: string;
  isGroupConversation: boolean | null;
};

export function ChatHeader({
  contactUser,
  pusherClient,
  conversationId,
  loggedInUserId,
  organizationId,
  isGroupConversation,
}: Props) {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setIsTyping(false);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isTyping]);

  useEffect(() => {
    if (!loggedInUserId) {
      return;
    }

    const handleTyping = ({ user }: { user: { id: string; name: string } }) => {
      if (!isGroupConversation && user.id !== loggedInUserId) {
        setIsTyping(true);
      }
    };

    pusherClient.subscribe(conversationId);
    pusherClient.bind("typing", handleTyping);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind("typing", handleTyping);
    };
  }, [conversationId, isGroupConversation, loggedInUserId, pusherClient]);

  return (
    <div className="flex items-center gap-4 h-16 px-4">
      <Avatar>
        <AvatarImage src={contactUser.photo || ""} alt={contactUser.name} />
        <AvatarFallback>{contactUser.name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <p className="truncate font-semibold text-sm">{contactUser.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {isTyping ? "Typing..." : "Offline"}
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  type LoaderFunctionArgs,
  json,
  type SerializeFrom,
} from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { buttonVariants } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { getUserConversations } from "~/services/chat.server";
import { useLoggedInUser } from "~/utils/auth";
import { requireUser } from "~/utils/auth.server";
import { createPusherClient } from "~/utils/pusher/pusher";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);

  const conversations = await getUserConversations({ userId: loggedInUser.id });

  return json({
    conversations,
    pusher: {
      appKey: process.env.PUSHER_APP_KEY!,
      cluster: process.env.PUSHER_APP_CLUSTER!,
    },
  });
}

type UserConversations = SerializeFrom<ReturnType<typeof getUserConversations>>;

export default function Chat() {
  const { conversations: serverConversations, pusher } =
    useLoaderData<typeof loader>();
  const [pusherClient] = useState(() =>
    createPusherClient(pusher.appKey, pusher.cluster)
  );
  const user = useLoggedInUser();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const [conversations, setConversations] =
    useState<UserConversations>(serverConversations);

  useEffect(() => {
    if (!user) {
      return;
    }

    const newConversationHandler = (
      newConversation: UserConversations[number]
    ) => {
      setConversations((prev) => [...prev, newConversation]);
    };

    pusherClient.subscribe(user.id);
    pusherClient.bind("conversation:new", newConversationHandler);

    return () => {
      pusherClient.unsubscribe(user.id);
      pusherClient.unbind("conversation:new", newConversationHandler);
    };
  }, [pusherClient, user]);

  return (
    <div className="flex h-[calc(100vh-64px)] items-stretch overflow-hidden">
      <div className="flex-1">
        <Outlet context={{ pusherClient }} />
      </div>
      <div className="w-[280px] border-l py-4">
        <div className="px-4">
          <Link
            to="new"
            className={buttonVariants({
              className: "w-full",
              variant: "outline",
            })}
          >
            <Plus className="w-4 h-4 -ml-4 mr-2" />
            Add Contact / Create Group
          </Link>
        </div>
        <Separator className="my-4" />
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-1/3">
            <img src="/no-data.svg" alt="no data" className="w-10" />
            <p className="text-muted-foreground mt-2">No conversations</p>
          </div>
        )}
        <ul className="px-4 space-y-2">
          {conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              active={location.pathname.includes(conversation.id)}
              conversation={conversation}
              loggedInUserId={user?.id || ""}
              onClick={() =>
                params.id === conversation.id
                  ? navigate(`/app/chat`)
                  : navigate(conversation.id)
              }
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

type Props = {
  conversation: {
    id: string;
    isGroup?: boolean | null;
    name?: string | null;
    users: { id: string; name: string; photo?: string | null }[];
    lastMessageAt: string;
  };
  loggedInUserId: string;
  onClick: () => void;
  active: boolean;
};

function ConversationListItem({
  conversation,
  loggedInUserId,
  onClick,
  active,
}: Props) {
  if (conversation.isGroup) {
    return <li key={conversation.id}>{conversation.name}</li>;
  }
  const contactUser = conversation.users.filter(
    (user) => user.id !== loggedInUserId
  )[0];
  return (
    <li
      className={cn(
        "flex gap-2 items-center hover:bg-accent rounded p-1 cursor-pointer",
        active && "bg-accent"
      )}
      onClick={onClick}
    >
      <Avatar className="w-8 h-8">
        <AvatarImage
          src={contactUser.photo || ""}
          alt={contactUser.name}
          className="object-cover"
        />
        <AvatarFallback>{contactUser.name[0]}</AvatarFallback>
      </Avatar>
      <span className="truncate font-semibold text-sm">{contactUser.name}</span>
    </li>
  );
}

import { type Message } from "@prisma/client";
import {
  redirect,
  type LoaderFunctionArgs,
  json,
  type ActionFunctionArgs,
  type SerializeFrom,
} from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import { Paperclip, Send } from "lucide-react";
import type PusherClient from "pusher-js";
import { useEffect, useRef, useState } from "react";
// import debounce from "lodash.debounce";
import { FileTrigger, Button } from "react-aria-components";

import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { useLoggedInUser } from "~/utils/auth";
import { requireOrganizationUser } from "~/utils/auth.server";
import { pusherServer } from "~/utils/pusher/pusher.server";
import { ChatHeader } from "./header";
import { createMessage, getConversation } from "~/services/chat.server";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";

const schema = z.object({
  file: z.instanceof(File, { message: "File is required" }).optional(),
  body: z.string().optional(),
});

export async function action({ params, request }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const conversationId = params.id;
  if (!conversationId) {
    return redirect(`/app/${organizationId}/chat`);
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission);
  }

  const { body, file } = submission.value;

  const message = await createMessage({
    organizationId,
    body: body || "",
    conversationId,
    senderId: loggedInUser.id,
    file,
  });

  pusherServer.trigger(conversationId, "message:new", message);

  return json({ id: message.id });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const conversationId = params.id;
  if (!conversationId) {
    return redirect(`/app/${organizationId}/chat`);
  }

  const conversation = await getConversation({ conversationId });

  if (!conversation) {
    return redirect(`/app/${organizationId}/chat`);
  }

  return json({ conversation });
}

type OutletContext = {
  pusherClient: PusherClient;
};

export default function ChatRoom() {
  // const actionData = useActionData<typeof action>();
  const { conversation } = useLoaderData<typeof loader>();
  const loggedInUser = useLoggedInUser();
  const { orgId } = useParams<{ orgId: string; id: string }>();
  const formRef = useRef<HTMLFormElement>(null);
  // const navigation = useNavigation();
  // const submitting = navigation.state === "submitting";
  const { pusherClient } = useOutletContext<OutletContext>();
  // const typingFetcher = useFetcher();
  const fetcher = useFetcher();
  const submitting = fetcher.state === "submitting";
  const [messages, setMessages] = useState<SerializeFrom<Message[]>>(
    conversation.messages
  );

  const contactUser = conversation.users.filter(
    (user) => user.id !== loggedInUser?.id
  )[0];

  useEffect(() => {
    if (!submitting) {
      formRef.current?.reset();
    }
  }, [submitting]);

  useEffect(() => {
    if (fetcher.data) {
      formRef.current?.reset();
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (!loggedInUser) {
      return;
    }
    const handleNewMessage = (message: SerializeFrom<Message>) => {
      setMessages((prev) => [...prev, message]);
    };

    pusherClient.subscribe(conversation.id);
    pusherClient.bind("message:new", handleNewMessage);

    return () => {
      pusherClient.unsubscribe(conversation.id);
      pusherClient.unbind("message:new", handleNewMessage);
    };
  }, [conversation.id, conversation.isGroup, loggedInUser, pusherClient]);

  // const handleTyping = debounce(() => {
  //   typingFetcher.submit(null, {
  //     method: "POST",
  //     action: `/app/${orgId}/chat/${id}/typing`,
  //   });
  // }, 500);
  const handleUploadFile = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("_action", "upload");
    fetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
    });
  };

  console.log({ pusherClient });

  return (
    <div className="max-w-4xl mx-auto border-x h-[calc(100vh-64px)] overflow-auto bg-neutral-50 dark:bg-neutral-900 flex flex-col">
      <ChatHeader
        contactUser={contactUser}
        conversationId={conversation.id}
        isGroupConversation={conversation.isGroup}
        loggedInUserId={loggedInUser?.id}
        organizationId={orgId}
        pusherClient={pusherClient}
      />
      <Separator />
      <ul className="flex-1 bg-neutral-50 dark:bg-neutral-900 flex flex-col justify-end p-4 gap-1.5">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            loggedInUserId={loggedInUser?.id || ""}
          />
        ))}
      </ul>
      <Separator />
      <fetcher.Form ref={formRef} method="post" className="px-4 py-3">
        <div className="flex gap-2 items-center">
          <FileTrigger
            allowsMultiple={false}
            onSelect={(e) => {
              if (e) {
                const files = Array.from(e);
                if (files.length) {
                  handleUploadFile(files[0]);
                }
              }
            }}
          >
            <Button
              type="button"
              className={buttonVariants({
                size: "icon",
                variant: "outline",
              })}
              isDisabled={
                fetcher.formData?.get("action") === "upload" && submitting
              }
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </FileTrigger>
          <Input
            autoFocus
            autoComplete="off"
            name="body"
            className="bg-background focus-visible:ring-0"
            required
            // onKeyDown={handleTyping}
          />
          <Button type="submit" className={buttonVariants({ size: "icon" })}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}

export function MessageItem({
  loggedInUserId,
  message,
}: {
  message: SerializeFrom<Message>;
  loggedInUserId: string;
}) {
  const myMessage = loggedInUserId === message.senderId;
  return (
    <li
      key={message.id}
      className={cn(
        "py-1.5 pl-3 pr-12 rounded relative",
        myMessage
          ? "self-end bg-green-300 dark:bg-green-900"
          : "self-start bg-gray-200 dark:bg-gray-600"
      )}
    >
      {message.body ? <span>{message.body}</span> : null}
      {message.fileUrl ? (
        <a href={message.fileUrl} target="_blank" rel="noreferrer">
          <img
            src={message.fileUrl}
            alt="attachment"
            className="w-16 h-16 rounded-md my-2 brightness-50 hover:brightness-100"
          />
        </a>
      ) : null}
      <span className="absolute text-xs text-muted-foreground bottom-1 right-1">
        {new Date(message.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </span>
    </li>
  );
}

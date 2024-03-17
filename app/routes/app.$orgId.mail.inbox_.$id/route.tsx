import {
  redirect,
  type LoaderFunctionArgs,
  json,
  type SerializeFrom,
} from "@remix-run/node";
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import type { Mail, User } from "@prisma/client";

import Tiptap from "~/components/tiptap";
import { requireOrganizationUser } from "~/utils/auth.server";
import { Separator } from "~/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import MainContainer from "~/components/main-container";
import { getInboxMailById } from "~/services/mail.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }
  const inboxId = params.id;
  if (!inboxId) {
    return redirect(`/app/${organizationId}/mail/inbox`);
  }
  const inbox = await getInboxMailById({ id: inboxId });
  if (!inbox) {
    return redirect(`/app/${organizationId}/mail/inbox`);
  }

  return json({ inbox });
}

type Inbox = Mail & { sender: User; receiver: User | null };

export type InboxMailDetailOutletContext = {
  inbox: SerializeFrom<Inbox>;
};

export default function InboxMailDetail() {
  const { inbox } = useLoaderData<typeof loader>();
  const { orgId } = useParams<{ orgId: string }>();

  const outletContext: InboxMailDetailOutletContext = { inbox };

  return (
    <MainContainer>
      <Link to={`/app/${orgId}/mail/inbox`} className="hover:underline">
        &larr; Inbox
      </Link>
      <div className="mt-4 border rounded-md">
        <h1 className="font-semibold text-xl px-6 py-4 bg-neutral-50 dark:bg-neutral-900">
          {inbox.subject}
        </h1>
        <Separator />
        <div className="flex gap-2 items-center px-5 pt-4">
          <Avatar>
            <AvatarImage
              src={inbox.sender.photo || ""}
              alt={inbox.sender.name}
            />
            <AvatarFallback>{inbox.sender.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2 items-center">
            <p className="font-medium">{inbox.sender.name}</p>
            <p className="text-muted-foreground text-sm">
              {inbox.sender.email}
            </p>
          </div>
        </div>
        <div className="px-12">
          <Tiptap name="body" content={inbox.body} editable={false} />
          <ul className="my-6 px-4 flex gap-4 flex-wrap">
            {inbox.attachments.map((attachment) => (
              <li key={attachment.id}>
                <a
                  href={attachment.url}
                  className="border px-2 pt-0.5 pb-1 text-sm hover:bg-accent rounded-full"
                  target="_blank"
                  rel="noreferrer"
                >
                  {attachment.displayName}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {inbox.children.map((mail) => (
        <div key={mail.id} className="mt-4 border rounded-md">
          <div className="flex gap-2 items-center px-5 pt-4">
            <Avatar>
              <AvatarImage
                src={mail.sender.photo || ""}
                alt={mail.sender.name}
              />
              <AvatarFallback>{mail.sender.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex gap-2 items-center">
              <p className="font-medium">{mail.sender.name}</p>
              <p className="text-muted-foreground text-sm">
                {mail.sender.email}
              </p>
            </div>
          </div>
          <div className="px-12">
            <Tiptap name="body" content={mail.body} editable={false} />
          </div>
        </div>
      ))}
      <Outlet context={outletContext} />
    </MainContainer>
  );
}

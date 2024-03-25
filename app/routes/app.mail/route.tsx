import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { File, Inbox, Pencil, Send } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  getDraftMailCount,
  getInboxMailCount,
  getSentMailCount,
} from "~/services/mail.server";
import { requireUser } from "~/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);

  const [inboxMailCount, sentMailCount, draftMailCount] = await Promise.all([
    getInboxMailCount({ receiverId: loggedInUser.id }),
    getSentMailCount({ senderId: loggedInUser.id }),
    getDraftMailCount({ senderId: loggedInUser.id }),
  ]);

  return json({ inboxMailCount, sentMailCount, draftMailCount });
}

export default function Mail() {
  const { draftMailCount, inboxMailCount, sentMailCount } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex h-[calc(100vh-64px)] items-stretch overflow-hidden">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <div className="w-[280px] border-l py-4">
        <div className="px-4">
          <Link
            to="new"
            className={buttonVariants({
              className: "w-full",
            })}
          >
            <Pencil className="w-4 h-4 -ml-4 mr-2" />
            Write
          </Link>
        </div>
        <Separator className="my-4" />
        <ul className="px-4 space-y-2">
          <li>
            <Link
              to="inbox"
              className={buttonVariants({
                variant: "outline",
                className: "w-full flex justify-between",
              })}
            >
              <p className="flex items-center">
                <Inbox className="mr-2 w-4 h-4" />
                Inbox
              </p>
              <Badge>{inboxMailCount}</Badge>
            </Link>
          </li>
          <li>
            <Link
              to="sent"
              className={buttonVariants({
                variant: "outline",
                className: "w-full flex justify-between",
              })}
            >
              <p className="flex items-center">
                <Send className="mr-2 w-4 h-4" />
                Sent
              </p>
              <Badge>{sentMailCount}</Badge>
            </Link>
          </li>
          <li>
            <Link
              to="draft"
              className={buttonVariants({
                variant: "outline",
                className: "w-full flex justify-between",
              })}
            >
              <p className="flex items-center">
                <File className="mr-2 w-4 h-4" />
                Draft
              </p>
              <Badge>{draftMailCount}</Badge>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

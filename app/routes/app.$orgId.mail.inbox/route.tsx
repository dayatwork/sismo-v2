import { type LoaderFunctionArgs, redirect, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Inbox, MailOpen, Reply, Trash2 } from "lucide-react";

import MainContainer from "~/components/main-container";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { getInboxMails } from "~/services/mail.server";
import { requireOrganizationUser } from "~/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);

  if (!loggedInUser) {
    return redirect("/app");
  }

  const inboxMails = await getInboxMails({
    organizationId,
    receiverId: loggedInUser.id,
  });

  return json({ inboxMails });
}

export default function InboxMail() {
  const { inboxMails } = useLoaderData<typeof loader>();
  return (
    <MainContainer>
      <div className="flex gap-4 mb-6 items-center">
        <Inbox className="w-6 h-6" />
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
      </div>

      <div className="mt-2 rounded-md border bg-neutral-50 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[150px]">Sender</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inboxMails.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-10 text-muted-foreground"
                >
                  No inbox
                </TableCell>
              </TableRow>
            )}
            {inboxMails.map((mail) => (
              <TableRow key={mail.id} className="group">
                <TableCell className="px-6 w-[150px] whitespace-nowrap">
                  {mail.sender.name}
                </TableCell>
                <TableCell>
                  <Link
                    to={mail.id}
                    className={cn(
                      "hover:underline",
                      mail.status === "SENT" && "font-semibold"
                    )}
                  >
                    {mail.subject ||
                      (mail.parent?.subject
                        ? `Reply to: ${mail.parent?.subject}`
                        : "")}
                  </Link>
                </TableCell>

                <TableCell className="flex justify-end items-center gap-2 h-12 pr-6">
                  <span className="group-hover:hidden text-xs text-muted-foreground">
                    {new Date(mail.sentAt).toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="hidden group-hover:flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-8 h-8"
                          >
                            <span className="sr-only">Reply</span>
                            <Reply className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reply</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-8 h-8"
                          >
                            <span className="sr-only">Mark as Read</span>
                            <MailOpen className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Read</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            className="text-red-600 w-8 h-8"
                            variant="outline"
                          >
                            <span className="sr-only">Delete</span>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MainContainer>
  );
}

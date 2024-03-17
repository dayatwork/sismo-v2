import { type LoaderFunctionArgs, redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Send, Trash2 } from "lucide-react";

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
import { getSentMails } from "~/services/mail.server";
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

  const sentMails = await getSentMails({
    organizationId,
    senderId: loggedInUser.id,
  });

  return json({ sentMails });
}

export default function SentMail() {
  const { sentMails } = useLoaderData<typeof loader>();
  return (
    <MainContainer>
      <div className="flex gap-4 mb-6 items-center">
        <Send className="w-6 h-6" />
        <h1 className="text-2xl font-bold tracking-tight">Sent</h1>
      </div>

      <div className="mt-2 rounded-md border bg-neutral-50 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[150px]">Receivers</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sentMails.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-10 text-muted-foreground"
                >
                  No sent mail
                </TableCell>
              </TableRow>
            )}
            {sentMails.map((mail) => (
              <TableRow key={mail.id} className="group">
                <TableCell className="px-6 w-[150px] whitespace-nowrap">
                  {mail.receiver?.name}
                </TableCell>
                <TableCell>{mail.subject}</TableCell>

                <TableCell className="flex justify-end items-center gap-2 h-12 pr-6">
                  <span className="group-hover:hidden text-xs text-muted-foreground">
                    {new Date(mail.sentAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <div className="hidden group-hover:flex gap-2">
                    <Button
                      size="icon"
                      className="text-red-600 w-8 h-8"
                      variant="outline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

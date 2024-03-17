import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { PlusIcon, UploadIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { authenticator } from "~/services/auth.server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { AttachmentCard } from "~/components/attachment-card";
import { getStageAttachments } from "~/services/attachment.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });
  const stageId = params.id;

  if (!stageId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const attachments = await getStageAttachments({ organizationId, stageId });

  return json({ attachments });
}

export default function StageDocuments() {
  const { attachments } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <Outlet />
      <div className="-mt-px border rounded-b-md rounded-tr-md bg-neutral-50 dark:bg-neutral-900">
        <div className="py-2 px-6 flex justify-between items-center">
          <h2 className="font-semibold text-primary">Documents</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Action
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Action</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate("upload")}>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  <span>Upload File</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("add-link")}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  <span>Add Link</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator />
        {attachments.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">
            No documents
          </p>
        ) : (
          <ul className="p-6 grid grid-cols-2 sm:flex gap-4 flex-wrap">
            {attachments.map((attachment) => (
              <li key={attachment.id}>
                <AttachmentCard attachment={attachment} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

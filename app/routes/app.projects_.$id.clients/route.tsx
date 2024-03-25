import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { CrownIcon, PlusIcon } from "lucide-react";
import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getProjectClients } from "~/services/project.server";
import { requireUser } from "~/utils/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/projects`);
  }

  const projectClients = await getProjectClients({ projectId });

  return json({ projectClients });
}

export default function ProjectOverview() {
  const navigate = useNavigate();
  const { projectClients } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <div className="-mt-px border rounded-md bg-neutral-50 dark:bg-neutral-900">
        <div className="py-2 px-6 flex justify-between items-center">
          <h2 className="font-semibold text-primary">Clients</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Action
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Action</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="pr-4"
                onClick={() => navigate("add")}
              >
                <PlusIcon className="mr-2 w-4 h-4" />
                Add New Client
              </DropdownMenuItem>
              <DropdownMenuItem
                className="pr-4"
                onClick={() => navigate("set-main")}
              >
                <CrownIcon className="mr-2 w-4 h-4" />
                Set Main Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator />
        {projectClients.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground text-sm">
            No clients
          </p>
        ) : (
          <ol className="p-6 space-y-4">
            {projectClients.map((projectClient, index) => (
              <li key={projectClient.id} className="flex gap-4">
                <span className="font-semibold text-left w-3">
                  {index + 1}.
                </span>
                <p className="font-semibold">{projectClient.client.name}</p>
                {projectClient.isMain && (
                  <Badge className="uppercase">Main Client</Badge>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}

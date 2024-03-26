import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import {
  Building2,
  FolderKanbanIcon,
  KeyRoundIcon,
  LayoutDashboard,
  MoreHorizontalIcon,
  PlusIcon,
  UsersRoundIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getWorkspaceById } from "~/services/workspace.server";

import { requireUser } from "~/utils/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const workspaceId = params.id;
  if (!workspaceId) {
    return redirect("/app/workspaces");
  }

  await requireUser(request);

  const workspace = await getWorkspaceById({ id: workspaceId });
  if (!workspace) {
    return redirect("/app/workspaces");
  }

  return json({ workspace });
}

export default function Workspaces() {
  const { workspace } = useLoaderData<typeof loader>();

  return (
    <div>
      {/* <div className="h-40 bg-neutral-950 border-b relative group hover:bg-neutral-900">
        <Button
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all"
          variant="outline"
        >
          Change Cover
        </Button>
      </div> */}
      <Outlet />
      <div className="relative max-w-7xl mx-auto px-4 mt-5">
        <div className="flex gap-5">
          {workspace.coverImage ? (
            <img
              className="h-32 w-32 rounded-xl border-4 shadow object-cover"
              style={{
                borderColor: workspace.brandColor || "#222",
              }}
              src={workspace.coverImage}
              alt={workspace.name}
            />
          ) : (
            <div
              className="h-32 w-32 rounded-xl border-4 shadow flex items-center justify-center"
              style={{
                borderColor: workspace.brandColor || "#222",
              }}
            >
              <Building2 className="w-14 h-14" />
            </div>
          )}
          <div>
            <Breadcrumb className="mb-4 mt-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/app/dashboard">
                    <span className="sr-only">Dashboard</span>
                    <LayoutDashboard className="w-5 h-5" />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/app/workspaces">
                    Workspaces
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{workspace.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h2 className="text-3xl font-bold">{workspace.name}</h2>
            <p className="text-muted-foreground">{workspace.description}</p>
          </div>
          <Button size="icon" className="ml-auto mt-4" variant="outline">
            <MoreHorizontalIcon className="w-4 h-4" />
          </Button>
        </div>
        <Tabs defaultValue="boards" className="mt-6">
          <TabsList>
            <TabsTrigger className="w-32" value="boards">
              <FolderKanbanIcon className="w-4 h-4 mr-2" />
              Boards
            </TabsTrigger>
            <TabsTrigger className="w-32" value="members">
              <UsersRoundIcon className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger className="w-32" value="permissions">
              <KeyRoundIcon className="w-4 h-4 mr-2" />
              Permissions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="boards">
            <div className="flex items-center justify-between mt-4 mb-2">
              <Input placeholder="Search board..." className="max-w-[250px]" />
              <Link
                to="new-board"
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                <PlusIcon className="w-3.5 h-3.5 mr-2" /> New Board
              </Link>
            </div>
            {workspace.boards.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground">No boards</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="members">
            <div className="flex items-center justify-between mt-4 mb-2">
              <Input placeholder="Search member..." className="max-w-[250px]" />
              <Link
                to="new-member"
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                <PlusIcon className="w-3.5 h-3.5 mr-2" /> New Member
              </Link>
            </div>
            {workspace.workspaceMembers.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground">No members</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="permissions">
            <div className="flex items-center justify-between mt-4 mb-2">
              <Input placeholder="Search role..." className="max-w-[250px]" />
              <Link
                to="new-role"
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                <PlusIcon className="w-3.5 h-3.5 mr-2" /> New Role
              </Link>
            </div>
            {workspace.workspaceRoles.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground">No roles</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

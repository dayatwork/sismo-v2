import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import {
  BadgeCheckIcon,
  CheckIcon,
  FlagIcon,
  PauseIcon,
  PenSquareIcon,
  PlayIcon,
  Trash2Icon,
  TrophyIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ProtectComponent } from "~/utils/auth";
import {
  type ProjectStatus,
  projectStatusColor,
  projectStatuses,
} from "~/utils/project";
import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { getProjectById } from "~/services/project.server";
import { requireUser } from "~/utils/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);
  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/projects`);
  }

  const project = await getProjectById({ id: projectId });

  if (!project) {
    return redirect(`/app/projects`);
  }

  return json({ project });
}

export default function ProjectOverview() {
  const { project } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <Outlet />
      <div className="-mt-px border rounded-md bg-neutral-50 dark:bg-neutral-900">
        <div className="py-2 px-6 flex justify-between items-center">
          <h2 className="font-semibold text-primary">Overview</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Action
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Action</DropdownMenuLabel>
              <ProtectComponent permission="manage:project">
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate("edit-name")}>
                    <PenSquareIcon className="w-4 h-4 mr-2" />
                    <span>Edit Project Name</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("edit-service-product")}
                  >
                    <PenSquareIcon className="w-4 h-4 mr-2" />
                    <span>Edit Service & Product</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </ProtectComponent>
              <ProtectComponent permission="manage:project">
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("change-champion")}>
                  <TrophyIcon className="mr-2 w-4 h-4" />
                  <span>Change Champion</span>
                </DropdownMenuItem>
              </ProtectComponent>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="font-semibold text-blue-600 dark:text-blue-500"
                  disabled={!["UNSTARTED", "ONHOLD"].includes(project.status)}
                  onClick={() => navigate("start-project")}
                >
                  <PlayIcon className="w-4 h-4 mr-2" />
                  <span>Start Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="font-semibold text-yellow-600 dark:text-yellow-500"
                  disabled={project.status !== "ONGOING"}
                  onClick={() => navigate("hold-project")}
                >
                  <PauseIcon className="w-4 h-4 mr-2" />
                  <span>Hold Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="font-semibold text-orange-600 dark:text-orange-500"
                  disabled={!["ongoing", "ONHOLD"].includes(project.status)}
                  onClick={() => navigate("close-project")}
                >
                  <FlagIcon className="w-4 h-4 mr-2" />
                  <span>Close Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="font-semibold text-red-600 dark:text-red-500"
                  // TODO: check whether the closing stage is complete
                  disabled={
                    project.status !== "CLOSING" ||
                    project.closingReason !== "CANCEL"
                  }
                  onClick={() => navigate("cancel-project")}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  <span>Cancel Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="font-semibold text-green-600 dark:text-green-500"
                  // TODO: check whether the closing stage is complete
                  disabled={
                    project.status !== "CLOSING" ||
                    project.closingReason !== "COMPLETE"
                  }
                  onClick={() => navigate("complete-project")}
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  <span>Complete Project</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <ProtectComponent permission="manage:project">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="font-semibold text-red-600 dark:text-red-500"
                  disabled={!["PROPOSED", "UNSTARTED"].includes(project.status)}
                  onClick={() => navigate("delete-project")}
                >
                  <Trash2Icon className="w-4 h-4 mr-2" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </ProtectComponent>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator />
        <dl className="py-4 px-6 space-y-6">
          <div className="flex items-center">
            <dt className="w-40 text-muted-foreground text-sm">Project Name</dt>
            <dd className="capitalize font-semibold text-sm">{project.name}</dd>
          </div>
          <div className="flex items-center">
            <dt className="w-40 text-muted-foreground text-sm">Project Code</dt>
            <dd className="capitalize font-semibold text-sm">{project.code}</dd>
          </div>
          <div className="flex items-center">
            <dt className="w-40 text-muted-foreground text-sm">
              Project Description
            </dt>
            <dd className="capitalize font-semibold text-sm">
              {project.description || "-"}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="w-40 text-muted-foreground text-sm">Champion</dt>
            <dd className="capitalize font-semibold text-sm">
              {project.champion?.name || "-"}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="w-40 text-muted-foreground text-sm">Service</dt>
            <dd className="capitalize font-semibold text-sm">
              {project.service?.name || "-"}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="w-40 text-muted-foreground text-sm">Product</dt>
            <dd className="capitalize font-semibold text-sm">
              {project.product?.name || "-"}
            </dd>
          </div>
          {/* <div className="flex items-center">
            <dt className="w-40 text-muted-foreground text-sm">Subproduct</dt>
            <dd className="capitalize font-semibold text-sm">
              {project.subProduct?.name || ""}
            </dd>
          </div> */}
          <div className="flex items-center">
            <dt className="w-40 text-muted-foreground text-sm">Main Client</dt>
            <dd className="capitalize font-semibold text-sm">
              {project.projectClients[0]?.client.name || "-"}
            </dd>
          </div>
          <div className="flex items-center">
            <dt className="w-40 text-muted-foreground text-sm">
              Project Status
            </dt>
            <dd className="capitalize font-semibold text-sm flex gap-4 items-center">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button>
                    <Badge
                      variant={
                        projectStatusColor[project.status as ProjectStatus]
                      }
                      className="-ml-1 uppercase justify-center"
                    >
                      {project.status.replace("_", " ")}
                    </Badge>
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-52">
                  <h3 className="capitalize font-semibold text-sm">
                    {project.name} Status
                  </h3>
                  <Separator className="my-4" />
                  <ul className="space-y-3 mb-3">
                    {projectStatuses.map((status) => (
                      <li key={status} className="flex items-center gap-4">
                        <Badge
                          variant={projectStatusColor[status]}
                          className="uppercase w-32 text-center justify-center"
                        >
                          {status.replace("_", " ")}
                        </Badge>
                        {status === project.status && (
                          <BadgeCheckIcon className="w-6 h-6 text-green-600" />
                        )}
                      </li>
                    ))}
                  </ul>
                </HoverCardContent>
              </HoverCard>
              {project.status === "CLOSING" && (
                <p className="text-sm text-muted-foreground">
                  Closing Reason: {project.closingReason}
                </p>
              )}
            </dd>
          </div>
          {/* <div className="flex items-center">
            <dt className="w-40 text-muted-foreground text-sm">Project Champion</dt>
            <dd className="capitalize font-semibold text-sm -ml-1">
              <Link
                to={`/app/employees/${project.championId}`}
                className="flex items-center gap-2 hover:text-primary hover:underline"
              >
                <Avatar>
                  <AvatarImage
                    src={project.champion.photo}
                    alt={project.champion.name}
                    className="object-cover"
                  />
                  <AvatarFallback>{project.champion.name[0]}</AvatarFallback>
                </Avatar>
                <span>{project.champion.name}</span>
              </Link>
            </dd>
          </div> */}
        </dl>
      </div>
    </>
  );
}

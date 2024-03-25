import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import {
  BadgeCheckIcon,
  CheckIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Separator } from "~/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  type StageStatus,
  stageStatusColor,
  stageStatuses,
} from "~/utils/stage";
import { getStages } from "~/services/stage.server";
import { requireUser } from "~/utils/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/projects`);
  }

  await requireUser(request);

  const stages = await getStages({ projectId });

  return json({ stages });
}

export default function ProjectStages() {
  const { stages } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <Outlet />
      <div className="-mt-px border rounded-md bg-neutral-50 dark:bg-neutral-900">
        <div className="px-6 py-2 flex justify-between items-center">
          <h3 className="font-semibold text-primary ">Project Stages</h3>
          <Button asChild variant="outline" size="sm">
            <Link to="new">Create New Stage</Link>
          </Button>
        </div>
        <Separator />
        {stages.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground text-sm">
            No stages
          </p>
        ) : (
          <div>
            {stages.map((stage) => {
              const totalCompletedMilestones = stage.milestones.filter(
                (milestone) =>
                  milestone.tasks.filter((task) => task.status !== "CANCELED")
                    .length ===
                  milestone.tasks.filter((task) => task.status === "DONE")
                    .length
              ).length;
              const totalMilestones = stage.milestones.length;
              const milestoneCompletionPercentage = stage.milestones.reduce(
                (acc, curr) => {
                  return (
                    acc +
                    (curr.tasks.filter((task) => task.status === "DONE")
                      .length /
                      curr.tasks.filter((task) => task.status !== "CANCELED")
                        .length) *
                      (curr.weight || 0)
                  );
                },
                0
              );
              return (
                <div
                  key={stage.id}
                  className="flex items-center gap-2 border-b last:border-b-0"
                >
                  <Link
                    to={`/app/stages/${stage.id}`}
                    className="border border-transparent hover:border-primary/50 hover:bg-primary/10 p-4 flex-1 group flex justify-between"
                  >
                    <div className="flex gap-4 items-center">
                      <p className="shadow text-lg font-bold bg-primary text-primary-foreground flex justify-center items-center w-8 h-8 rounded-xl">
                        {stage.stageOrder}
                      </p>
                      <p className="capitalize font-bold text-xl group-hover:text-primary">
                        {stage.name}
                      </p>
                    </div>
                    <div className="flex gap-4 items-center">
                      <dl className="flex items-center gap-2 pl-3 pr-2 py-1.5 border rounded-md bg-background font-semibold text-sm">
                        <dt>Milestones</dt>
                        <span>:</span>
                        <dd className="flex items-center gap-4">
                          {`${totalCompletedMilestones} / ${totalMilestones}`}
                          <span
                            className={cn(
                              "py-0.5  text-foreground rounded w-12 text-center",
                              milestoneCompletionPercentage < 40
                                ? "bg-red-400 dark:bg-red-700"
                                : milestoneCompletionPercentage < 100
                                ? "bg-orange-400 dark:bg-orange-700"
                                : "bg-green-400 dark:bg-green-700"
                            )}
                          >
                            {milestoneCompletionPercentage}%
                          </span>
                        </dd>
                      </dl>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button>
                            <Badge
                              variant={
                                stageStatusColor[stage.status as StageStatus]
                              }
                              className="uppercase w-32 justify-center"
                            >
                              {stage.status.replace("_", " ")}
                            </Badge>
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-52">
                          <h3 className="capitalize font-semibold">
                            {stage.name} Status
                          </h3>
                          <Separator className="my-4" />
                          <ul className="space-y-3 mb-3">
                            {stageStatuses.map((status) => (
                              <li
                                key={status}
                                className="flex items-center gap-4"
                              >
                                <Badge
                                  variant={stageStatusColor[status]}
                                  className="uppercase w-32 text-center justify-center"
                                >
                                  {status.replace("_", " ")}
                                </Badge>
                                {status === stage.status && (
                                  <BadgeCheckIcon className="w-6 h-6 text-green-600" />
                                )}
                              </li>
                            ))}
                          </ul>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="mr-2" size="icon">
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Action</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className={cn(
                          ["UNSTARTED", "ONHOLD", "COMPLETED"].includes(
                            stage.status
                          ) &&
                            stage.project.status !== "UNSTARTED" &&
                            "text-blue-600",
                          "pr-4 font-semibold cursor-pointer"
                        )}
                        onClick={() => navigate(`${stage.id}/start`)}
                        disabled={
                          !["UNSTARTED", "ONHOLD", "COMPLETED"].includes(
                            stage.status
                          ) || stage.project.status === "UNSTARTED"
                        }
                      >
                        <PlayIcon className="w-4 h-4 mr-2" />
                        <span>Start {stage.name}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          stage.status === "ONGOING" && "text-orange-600",
                          "pr-4 font-semibold cursor-pointer"
                        )}
                        onClick={() => navigate(`${stage.id}/hold`)}
                        disabled={stage.status !== "ONGOING"}
                      >
                        <PauseIcon className="w-4 h-4 mr-2" />
                        <span>Hold {stage.name}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          stage.status === "ONGOING" && "text-green-600",
                          "pr-4 font-semibold cursor-pointer"
                        )}
                        disabled={stage.status !== "ONGOING"}
                        onClick={() => navigate(`${stage.id}/complete`)}
                      >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        <span>Complete {stage.name}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import {
  EyeIcon,
  MoreHorizontalIcon,
  PenSquareIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getMilestones } from "~/services/milestone.server";
import { cn } from "~/lib/utils";
import { requireUser } from "~/utils/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);

  const stageId = params.id!;

  const milestones = await getMilestones({ stageId });

  return json({ milestones });
}

export default function Milestones() {
  const { milestones } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const totalWeight = milestones.reduce(
    (acc, curr) => acc + (curr.weight || 0),
    0
  );

  return (
    <>
      <Outlet />
      <div className="-mt-px border rounded-b-md rounded-tr-md bg-neutral-50 dark:bg-neutral-900">
        <div className="py-2 px-6 flex justify-between items-center">
          <h2 className="font-semibold text-primary">Milestones</h2>

          {milestones.length > 0 && (
            <div className="flex gap-10 items-center">
              <dl
                className={cn(
                  "flex items-centerg gap-2 font-semibold border py-1 px-3  rounded bg-accent",
                  totalWeight > 100 && "text-red-600",
                  totalWeight < 100 && "text-orange-600"
                )}
              >
                <dt>Total Weight</dt>
                <span>:</span>
                <dd>{totalWeight}%</dd>
              </dl>
              <Button variant="outline" onClick={() => navigate("new")}>
                + New Milestone
              </Button>
            </div>
          )}
        </div>
        <Separator />
        {milestones.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Name</TableHead>
                <TableHead className="w-28 whitespace-nowrap">
                  Weight (%)
                </TableHead>
                <TableHead className="px-3 whitespace-nowrap">
                  Tasks (complete / total)
                </TableHead>
                <TableHead className="w-16">
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map((milestone) => (
                <TableRow key={milestone.id}>
                  <TableCell className="p-3 pl-6">
                    <p className="font-semibold text-base whitespace-nowrap">
                      {milestone.name}
                    </p>
                    <p className="text-muted-foreground truncate max-w-lg">
                      {milestone.description}
                    </p>
                  </TableCell>
                  <TableCell className="font-mono text-base">
                    {milestone.weight} %
                  </TableCell>
                  <TableCell className="p-3 w-52 font-mono text-base">
                    {milestone.tasks.filter((t) => t.status === "DONE").length}{" "}
                    / {milestone.tasks.length}
                  </TableCell>

                  <TableCell className="p-3 pr-6 w-16">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 border rounded">
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Action</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => navigate(`${milestone.id}/details`)}
                          >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            <span>Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`${milestone.id}/edit`)}
                          >
                            <PenSquareIcon className="w-4 h-4 mr-2" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`${milestone.id}/delete`)}
                            className="text-red-600"
                          >
                            <Trash2Icon className="w-4 h-4 mr-2" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="pb-10 pt-12 flex flex-col gap-2 items-center justify-center">
            <p className="text-muted-foreground">No Milestones</p>
            <Button
              variant="outline"
              size="sm"
              className="pl-2"
              onClick={() => navigate("new")}
            >
              <PlusIcon className="mr-2 w-4 h-4" />
              New Milestone
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

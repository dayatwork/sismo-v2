import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { MoreHorizontalIcon, Trash2 } from "lucide-react";

import MainContainer from "~/components/main-container";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
import { getClosedMeetings } from "~/services/meeting.server";
import { requireUser } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);

  const meetings = await getClosedMeetings();

  return json({ meetings });
}

export default function MeetingHistories() {
  const { meetings } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <Outlet />
      <MainContainer>
        <h1 className="text-2xl font-bold tracking-tight">Meeting Histories</h1>
        <div className="mt-4 rounded-md border bg-neutral-50 dark:bg-neutral-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 w-[150px]">Room Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No meetings
                  </TableCell>
                </TableRow>
              )}
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="pl-6 w-[150px] font-mono text-base font-semibold">
                    {meeting.roomName}
                  </TableCell>
                  <TableCell>{meeting.description}</TableCell>
                  <TableCell className="space-x-1">
                    {meeting.participants.map((participant) => (
                      <TooltipProvider key={participant.id}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Avatar>
                              <AvatarImage
                                src={participant.user.photo || ""}
                                alt={participant.user.name}
                              />
                              <AvatarFallback>
                                {participant.user.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            {participant.user.name}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </TableCell>

                  <TableCell className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontalIcon className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Action</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            navigate(`${meeting.roomName}/delete`);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MainContainer>
    </>
  );
}

import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import {
  History,
  MoreHorizontal,
  MoreHorizontalIcon,
  XSquare,
} from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { requireOrganizationUser } from "~/utils/auth.server";
import MeetingIcon from "./meeting-icon";
import { getOpenedMeetings } from "~/services/meeting.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }

  const meetings = await getOpenedMeetings({ organizationId });

  return json({ meetings });
}

export default function Meetings() {
  const { meetings } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="new">Create New Meeting</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => navigate(`/app/${orgId}/meeting-histories`)}
                >
                  <History className="w-4 h-4 mr-2" />
                  Meeting Histories
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {meetings.length === 0 && (
          <p className="py-24 text-muted-foreground text-center border border-dashed rounded-xl mt-6">
            No meetings
          </p>
        )}
        <ul className="mt-6 flex gap-4 flex-wrap">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="p-4 rounded border bg-neutral-50 dark:bg-neutral-900 w-[300px] relative flex flex-col justify-between"
            >
              <div>
                <div className="absolute w-5 h-5 border-2 border-neutral-50 dark:border-neutral-900 rounded-full bg-green-600 -top-2 -right-2 animate-pulse" />
                <div className="absolute w-5 h-5 border-2 border-neutral-50 dark:border-neutral-900 rounded-full bg-green-600 -top-2 -right-2 animate-ping" />

                <div className="flex justify-between items-center">
                  <p className="font-semibold font-mono bg-background border px-2 py-1 rounded-md">
                    Room: {meeting.roomName}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="w-8 h-8">
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Action</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          navigate(`${meeting.roomName}/close`);
                        }}
                        className="text-red-600"
                      >
                        <XSquare className="w-4 h-4 mr-2" />
                        Close Meeting
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="mt-4 text-muted-foreground px-2">
                  {meeting.description}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex gap-1 px-1">
                    {meeting.participants.map((participant) => (
                      <TooltipProvider key={participant.id}>
                        <Tooltip>
                          <TooltipTrigger className="relative">
                            <Avatar>
                              <AvatarImage
                                src={participant.user.photo || ""}
                                alt={participant.user.name}
                              />
                              <AvatarFallback>
                                {participant.user.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            {participant.joinedAt && !participant.leavedAt && (
                              <>
                                <div className="absolute w-3.5 h-3.5 border-2 border-neutral-50 dark:border-neutral-900 rounded-full bg-green-600 top-0 right-0 animate-pulse" />
                                <div className="absolute w-3.5 h-3.5 border-2 border-neutral-50 dark:border-neutral-900 rounded-full bg-green-600 top-0 right-0 animate-ping" />
                              </>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {participant.user.name}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate(meeting.roomName)}
                  className="bg-blue-600 text-white hover:bg-blue-700 pl-4 pr-3"
                >
                  <span className="mr-2">Join Meeting</span>
                  <MeetingIcon />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </MainContainer>
    </>
  );
}

import { type LoaderFunctionArgs, redirect, json } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { cn } from "~/lib/utils";
import { getOrganizationUsersForDashboard } from "~/services/dashboard.server";
import { useLiveLoader } from "~/utils/sse/use-live-loader";
import Timer from "./timer";
import { Separator } from "~/components/ui/separator";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const organizationUsers = await getOrganizationUsersForDashboard({
    organizationId,
  });

  return json({ organizationUsers });
}

export default function Dashboard() {
  const { organizationUsers } = useLiveLoader<typeof loader>();
  const { orgId } = useParams<{ orgId: string }>();

  const totalWorkingUsers = organizationUsers.filter(
    (orgUser) => orgUser.user.timeTrackers.length > 0
  ).length;
  const totalUsers = organizationUsers.length;

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-[calc(100vh-64px)]"
    >
      <ResizablePanel
        defaultSize={50}
        className="h-[calc(100vh-64px)]"
        minSize={15}
      >
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="py-6 px-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Dashboard</h2>
              </div>
              <div className="flex gap-4 flex-wrap"></div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Two</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={50}
        className="h-[calc(100vh-64px)]"
        minSize={15}
      >
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="py-6 px-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Working Users</h2>
                <p className="flex gap-1 border px-2 py-1 rounded-md">
                  <span className="font-semibold text-green-600">
                    {totalWorkingUsers}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="font-semibold">{totalUsers}</span>
                </p>
              </div>
              <ul className="flex flex-wrap gap-6">
                {organizationUsers
                  .sort((orgUser) =>
                    orgUser.user.timeTrackers.length > 0 ? -1 : 1
                  )
                  .map((orgUser) => (
                    <li key={orgUser.id}>
                      <Link to={`/app/${orgId}/employees/${orgUser.user.id}`}>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <button className="space-y-3 w-16 group">
                              <div className="rounded-md relative">
                                <img
                                  src={`https://ui-avatars.com/api/?name=${orgUser.user.name}`}
                                  alt={orgUser.user.name}
                                  className="h-16 w-auto object-cover transition-all group-hover:scale-105 aspect-square rounded-lg"
                                />
                                <span
                                  className={cn(
                                    orgUser.user.timeTrackers.length > 0
                                      ? "bg-green-600 animate-bounce"
                                      : "bg-slate-600 dark:bg-slate-400",
                                    `absolute w-5 h-5 rounded-full -top-2 -right-2 border-4 border-background`
                                  )}
                                ></span>
                                {orgUser.user.timeTrackers.length > 0 && (
                                  <div className="absolute bottom-0 inset-x-0">
                                    <Timer
                                      startTime={
                                        orgUser.user.timeTrackers[0].startAt
                                      }
                                      size="small"
                                      color="green"
                                      align="center"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1">
                                <h3 className="font-medium text-xs text-center">
                                  {orgUser.user.name}
                                </h3>
                              </div>
                            </button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-72">
                            <h2 className="font-semibold text-sm">
                              Tracker Info
                            </h2>
                            <Separator className="my-2" />
                            {orgUser.user.timeTrackers.length > 0 ? (
                              <div>
                                {orgUser.user.timeTrackers.map((tracker) => (
                                  <dl key={tracker.id} className="space-y-4">
                                    <div>
                                      <dt className="text-primary font-semibold">
                                        Timer
                                      </dt>
                                      <dd>
                                        <Timer startTime={tracker.startAt} />
                                      </dd>
                                    </div>
                                  </dl>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-sm text-muted-foreground">
                                Not working
                              </p>
                            )}
                          </HoverCardContent>
                        </HoverCard>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Four</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

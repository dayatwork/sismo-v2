import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";

import MainContainer from "~/components/main-container";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";
import Timer from "./timer";
import { useLiveLoader } from "~/utils/sse/use-live-loader";
import { getOrganizationUsersForDashboard } from "~/services/dashboard.server";

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

  return (
    <MainContainer>
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-lg">All Users</h2>
        <div className="flex gap-10">
          <p>
            <span className="font-bold text-2xl mr-2 text-green-600">
              {
                organizationUsers.filter(
                  (orgUser) => orgUser.user.timeTrackers.length > 0
                ).length
              }
            </span>
            Working
          </p>
          <p>
            <span className="font-bold text-2xl mr-2 text-slate-600 dark:text-slate-400">
              {
                organizationUsers.filter(
                  (orgUser) => orgUser.user.timeTrackers.length === 0
                ).length
              }
            </span>
            Not Working
          </p>
        </div>
      </div>
      <ul className="flex flex-wrap gap-6">
        {organizationUsers
          .sort((orgUser) => (orgUser.user.timeTrackers.length > 0 ? -1 : 1))
          .map((orgUser) => (
            <li key={orgUser.id}>
              <Link to={`/app/${orgId}/employees/${orgUser.user.id}`}>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="space-y-3 w-16 md:w-20 xl:w-24 group">
                      <div className="rounded-md relative">
                        <img
                          src={`https://ui-avatars.com/api/?name=${orgUser.user.name}`}
                          alt={orgUser.user.name}
                          className="h-16 md:h-20 xl:h-24 w-auto object-cover transition-all group-hover:scale-105 aspect-square rounded-lg"
                        />
                        <span
                          className={cn(
                            orgUser.user.timeTrackers.length > 0
                              ? "bg-green-600 animate-bounce"
                              : "bg-slate-600 dark:bg-slate-400",
                            `absolute w-6 h-6 rounded-full -top-2 -right-2 border-4 border-background`
                          )}
                        ></span>
                        {orgUser.user.timeTrackers.length > 0 && (
                          <div className="absolute bottom-0 inset-x-0">
                            <Timer
                              startTime={orgUser.user.timeTrackers[0].startAt}
                              size="small"
                              color="green"
                              align="center"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-medium text-sm text-center">
                          {orgUser.user.name}
                        </h3>
                      </div>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72">
                    <h2 className="font-semibold">Tracker Info</h2>
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
                      <p className="text-center text-muted-foreground">
                        Not working
                      </p>
                    )}
                  </HoverCardContent>
                </HoverCard>
              </Link>
            </li>
          ))}
      </ul>
    </MainContainer>
  );
}

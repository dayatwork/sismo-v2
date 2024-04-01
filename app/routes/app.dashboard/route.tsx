import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { cn } from "~/lib/utils";
import { useLiveLoader } from "~/utils/sse/use-live-loader";
import Timer from "./timer";
import { Separator } from "~/components/ui/separator";
import { getUsersForDashboard } from "~/services/user.server";

export async function loader() {
  const users = await getUsersForDashboard();

  return json({ users });
}

export default function Dashboard() {
  const { users } = useLiveLoader<typeof loader>();

  const totalWorkingUsers = users.filter(
    (user) => user.taskTrackers.length > 0
  ).length;
  const totalUsers = users.length;

  return (
    <main className="p-6 grid grid-cols-3">
      <h1 className="sr-only">Dashboard</h1>
      <div className="pt-2.5 pb-4 pl-5 pr-4 border rounded-xl bg-neutral-50 dark:bg-neutral-900">
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
          {users
            .sort((user) => (user.taskTrackers.length > 0 ? -1 : 1))
            .map((user) => (
              <li key={user.id}>
                <Link to={`/app/iam/users/${user.id}`}>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="space-y-3 w-20 group">
                        <div className="rounded-md relative">
                          <img
                            src={`https://ui-avatars.com/api/?name=${user.name}`}
                            alt={user.name}
                            className="h-20 w-auto object-cover transition-all group-hover:scale-105 aspect-square rounded-lg"
                          />
                          <span
                            className={cn(
                              user.taskTrackers.length > 0
                                ? "bg-green-600 animate-bounce"
                                : "bg-slate-600 dark:bg-slate-400",
                              `absolute w-5 h-5 rounded-full -top-2 -right-2 border-4 border-background`
                            )}
                          ></span>
                          {user.taskTrackers.length > 0 && (
                            <div className="absolute bottom-0 inset-x-0">
                              <Timer
                                startTime={user.taskTrackers[0].startAt}
                                size="small"
                                color="green"
                                align="center"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-medium text-xs text-center">
                            {user.name}
                          </h3>
                        </div>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-72">
                      <h2 className="font-semibold text-sm">Tracker Info</h2>
                      <Separator className="my-2" />
                      {user.taskTrackers.length > 0 ? (
                        <div>
                          {user.taskTrackers.map((tracker) => (
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
    </main>
  );
}

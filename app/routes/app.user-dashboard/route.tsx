import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import MainContainer from "~/components/main-container";
import { requirePermission } from "~/utils/auth.server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getUserDashboardData } from "~/services/user.server";
import dayjs from "dayjs";
import { Badge } from "~/components/ui/badge";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:employee");

  const dashboardData = await getUserDashboardData();

  return json({ dashboardData });
}

export default function UserDashboard() {
  const { dashboardData } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            User Management Dashboard
          </h1>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-6">
          <div className="border rounded-lg">
            <div className="px-4 py-3">
              <h2 className="text-xl text-muted-foreground mb-2">
                Total Users
              </h2>
              <p className="text-5xl font-medium">
                {dashboardData.users.length}{" "}
                <span className="text-base text-muted-foreground">users</span>
              </p>
            </div>
          </div>
          <div className="border rounded-lg">
            <div className="px-4 py-3">
              <h2 className="text-xl text-muted-foreground mb-2">
                Total Departments
              </h2>
              <p className="text-5xl font-medium">
                {dashboardData.departments.length}{" "}
                <span className="text-base text-muted-foreground">
                  departments
                </span>
              </p>
            </div>
          </div>
          <div className="border rounded-lg">
            <div className="px-4 py-3">
              <h2 className="text-xl text-muted-foreground mb-2">
                Total Teams
              </h2>
              <p className="text-5xl font-medium">
                {dashboardData.teams.length}{" "}
                <span className="text-base text-muted-foreground">teams</span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">User</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Departments</TableHead>
                <TableHead className="px-4">Teams</TableHead>
                <TableHead className="px-4 text-right">
                  Total Working Hours
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={user.photo || ""} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="uppercase"
                      variant={
                        user.memberStatus === "FULLTIME"
                          ? "green"
                          : user.memberStatus === "PARTTIME"
                          ? "blue"
                          : user.memberStatus === "INTERN"
                          ? "pink"
                          : user.memberStatus === "OUTSOURCED"
                          ? "indigo"
                          : "default"
                      }
                    >
                      {user.memberStatus || "No status"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4">
                    <ul className="flex items-center gap-1">
                      {user.departmentMembers.map((dm) => (
                        <li
                          key={dm.departmentId}
                          className="px-2 py-1 border rounded"
                        >
                          {dm.department.name}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="px-4">
                    <ul className="flex items-center gap-1">
                      {user.teamMembers.map((tm) => (
                        <li
                          key={tm.teamId}
                          className="px-2 py-1 border rounded"
                        >
                          {tm.team.name}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="px-4 text-base font-semibold text-right">
                    {(
                      user.taskTrackers.reduce((currDuration, timeTracker) => {
                        return (
                          dayjs(timeTracker.endAt).diff(
                            dayjs(timeTracker.startAt)
                          ) + currDuration
                        );
                      }, 0) /
                      (1000 * 60 * 60)
                    ).toFixed(1)}{" "}
                    Hours
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

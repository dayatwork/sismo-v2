import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import MainContainer from "~/components/main-container";
import { requirePermission } from "~/utils/auth.server";
import { getTaskDashboardData } from "~/services/workspace.server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:finance");

  const dashboardData = await getTaskDashboardData();

  return json({ dashboardData });
}

export default function TaskDashboard() {
  const { dashboardData } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Task Management Dashboard
          </h1>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-6">
          <div className="border rounded-lg">
            <div className="px-4 py-3">
              <h2 className="text-xl text-muted-foreground mb-2">
                Total Workspaces
              </h2>
              <p className="text-5xl font-medium">
                {dashboardData.totalWorkspaces}{" "}
                <span className="text-base text-muted-foreground">
                  workspaces
                </span>
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2">
              <dl className="p-4 border-t border-r">
                <dt className="text-muted-foreground">Private Workspaces</dt>
                <dd className="text-2xl font-semibold">
                  {dashboardData.totalPrivateWorkspaces}
                </dd>
              </dl>
              <dl className="p-4 border-t">
                <dt className="text-muted-foreground">Active Workspaces</dt>
                <dd className="text-2xl font-semibold">
                  {dashboardData.totalActiveWorkspaces}
                </dd>
              </dl>
            </div>
          </div>
          <div className="border rounded-lg">
            <div className="px-4 py-3">
              <h2 className="text-xl text-muted-foreground mb-2">
                Total Boards
              </h2>
              <p className="text-5xl font-medium">
                {dashboardData.totalBoards}{" "}
                <span className="text-base text-muted-foreground">boards</span>
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2">
              <dl className="p-4 border-t border-r">
                <dt className="text-muted-foreground">Private Boards</dt>
                <dd className="text-2xl font-semibold">
                  {dashboardData.totalPrivateBoards}
                </dd>
              </dl>
              <dl className="p-4 border-t">
                <dt className="text-muted-foreground">Active Boards</dt>
                <dd className="text-2xl font-semibold">
                  {dashboardData.totalActiveBoards}
                </dd>
              </dl>
            </div>
          </div>
          <div className="border rounded-lg">
            <div className="px-4 py-3">
              <h2 className="text-xl text-muted-foreground mb-2">
                Total Tasks
              </h2>
              <p className="text-5xl font-medium">
                {dashboardData.totalTasks}{" "}
                <span className="text-base text-muted-foreground">tasks</span>
              </p>
            </div>
            <div className="mt-4 grid grid-cols-3">
              <dl className="p-4 border-t border-r">
                <dt className="text-muted-foreground">Completed</dt>
                <dd className="text-2xl font-semibold">
                  {dashboardData.totalCompletedTasks}
                </dd>
              </dl>
              <dl className="p-4 border-t border-r">
                <dt className="text-muted-foreground">In Progress</dt>
                <dd className="text-2xl font-semibold">
                  {dashboardData.totalInprogressTasks}
                </dd>
              </dl>
              <dl className="p-4 border-t">
                <dt className="text-muted-foreground">Stuck</dt>
                <dd className="text-2xl font-semibold">
                  {dashboardData.totalStuckTasks}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="mt-6 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">User</TableHead>
                <TableHead className="px-4">Total Workspaces</TableHead>
                <TableHead className="px-4">Total Boards</TableHead>
                <TableHead className="px-4">Total Tasks</TableHead>
                <TableHead className="px-4">Total Completed Tasks</TableHead>
                <TableHead className="px-4">Tasks Success Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.usersData.map((userData) => (
                <TableRow key={userData.id}>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={userData.photo || ""} />
                        <AvatarFallback>{userData.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{userData.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    {userData.totalWorkspaces}
                  </TableCell>
                  <TableCell className="px-4">{userData.totalBoards}</TableCell>
                  <TableCell className="px-4">{userData.totalTasks}</TableCell>
                  <TableCell className="px-4">
                    {userData.totalCompletedTasks}
                  </TableCell>
                  <TableCell className="px-4">
                    {userData.totalTasks
                      ? (
                          userData.totalCompletedTasks / userData.totalTasks
                        ).toFixed(0)
                      : 0}
                    %
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

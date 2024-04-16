import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import MainContainer from "~/components/main-container";
import { requireUser } from "~/utils/auth.server";
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
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);

  const dashboardData = await getTaskDashboardData();

  return json({
    dashboardData: {
      ...dashboardData,
      totalPublicWorkspaces:
        dashboardData.totalWorkspaces - dashboardData.totalPrivateWorkspaces,
      totalNonActiveWorkspaces:
        dashboardData.totalWorkspaces - dashboardData.totalActiveWorkspaces,
      totalPublicBoards:
        dashboardData.totalBoards - dashboardData.totalPrivateBoards,
      totalNonActiveBoards:
        dashboardData.totalBoards - dashboardData.totalActiveBoards,
    },
  });
}

export default function TaskDashboard() {
  const { dashboardData } = useLoaderData<typeof loader>();

  const workspacesByPrivacy = [
    {
      name: "Public",
      value: dashboardData.totalPublicWorkspaces,
      color: "#fed7aa",
    },
    {
      name: "Private",
      value: dashboardData.totalPrivateWorkspaces,
      color: "#f97316",
    },
  ];

  const workspacesByStatus = [
    {
      name: "Active",
      value: dashboardData.totalActiveWorkspaces,
      color: "#22c55e",
    },
    {
      name: "Non-active",
      value: dashboardData.totalNonActiveWorkspaces,
      color: "#bbf7d0",
    },
  ];

  const boardsByPrivacy = [
    {
      name: "Public",
      value: dashboardData.totalPublicBoards,
      color: "#bae6fd",
    },
    {
      name: "Private",
      value: dashboardData.totalPrivateBoards,
      color: "#0369a1",
    },
  ];

  const boardsByStatus = [
    {
      name: "Active",
      value: dashboardData.totalActiveBoards,
      color: "#be185d",
    },
    {
      name: "Non-active",
      value: dashboardData.totalNonActiveBoards,
      color: "#fbcfe8",
    },
  ];

  const tasks = [
    {
      name: "Backlog",
      value: dashboardData.totalBacklogTasks,
      color: "#cbd5e1",
    },
    { name: "Todo", value: dashboardData.totalTodoTasks, color: "#22d3ee" },
    {
      name: "In Progress",
      value: dashboardData.totalInProgressTasks,
      color: "#4f46e5",
    },
    { name: "Done", value: dashboardData.totalDoneTasks, color: "#16a34a" },
    {
      name: "On Hold",
      value: dashboardData.totalOnHoldTasks,
      color: "#d97706",
    },
    { name: "Stuck", value: dashboardData.totalStuckTasks, color: "#ef4444" },
  ];

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Task Management Dashboard
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="col-span-1 border p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-muted-foreground">
                Workspaces
              </h3>
              <dl className="flex items-center gap-1.5 font-bold text-xl">
                <dt>Total</dt>
                <span>:</span>
                <dd>{dashboardData.totalWorkspaces}</dd>
              </dl>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    isAnimationActive={true}
                    data={workspacesByPrivacy}
                    cx="35%"
                    cy="60%"
                    outerRadius="65%"
                    innerRadius="35%"
                    fill="#8884d8"
                    paddingAngle={5}
                  >
                    {workspacesByPrivacy.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                      />
                    ))}
                  </Pie>
                  <Pie
                    dataKey="value"
                    isAnimationActive={true}
                    data={workspacesByStatus}
                    cx="65%"
                    cy="35%"
                    outerRadius="65%"
                    innerRadius="35%"
                    fill="#82ca9d"
                    paddingAngle={5}
                  >
                    {workspacesByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: "16px",
                      fontWeight: 500,
                      paddingTop: 2,
                      paddingBottom: 2,
                      borderRadius: 6,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <dl className="grid grid-cols-2">
              <div>
                {workspacesByPrivacy.map((workspace) => (
                  <div
                    key={workspace.name}
                    className="flex items-center gap-2 flex-row-reverse justify-end"
                  >
                    <dt className="text-muted-foreground">{workspace.name}</dt>
                    <dd className="flex items-center gap-2 font-mono">
                      <span
                        className="w-3.5 h-3.5 block rounded-full"
                        style={{ backgroundColor: workspace.color }}
                      ></span>
                      {workspace.value}
                    </dd>
                  </div>
                ))}
              </div>
              <div>
                {workspacesByStatus.map((workspace) => (
                  <div
                    key={workspace.name}
                    className="flex items-center gap-2 flex-row-reverse justify-end"
                  >
                    <dt className="text-muted-foreground">{workspace.name}</dt>
                    <dd className="flex items-center gap-2 font-mono">
                      <span
                        className="w-3.5 h-3.5 block rounded-full"
                        style={{ backgroundColor: workspace.color }}
                      ></span>
                      {workspace.value}
                    </dd>
                  </div>
                ))}
              </div>
            </dl>
          </div>
          <div className="col-span-1 border p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-muted-foreground">
                Boards
              </h3>
              <dl className="flex items-center gap-1.5 font-bold text-xl">
                <dt>Total</dt>
                <span>:</span>
                <dd>{dashboardData.totalBoards}</dd>
              </dl>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    isAnimationActive={true}
                    data={boardsByPrivacy}
                    cx="35%"
                    cy="60%"
                    outerRadius="65%"
                    innerRadius="35%"
                    fill="#8884d8"
                    paddingAngle={5}
                  >
                    {boardsByPrivacy.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                      />
                    ))}
                  </Pie>
                  <Pie
                    dataKey="value"
                    isAnimationActive={true}
                    data={boardsByStatus}
                    cx="65%"
                    cy="35%"
                    outerRadius="65%"
                    innerRadius="35%"
                    fill="#82ca9d"
                    paddingAngle={5}
                  >
                    {boardsByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: "16px",
                      fontWeight: 500,
                      paddingTop: 2,
                      paddingBottom: 2,
                      borderRadius: 6,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <dl className="grid grid-cols-2">
              <div>
                {boardsByPrivacy.map((board) => (
                  <div
                    key={board.name}
                    className="flex items-center gap-2 flex-row-reverse justify-end"
                  >
                    <dt className="text-muted-foreground">{board.name}</dt>
                    <dd className="flex items-center gap-2 font-mono">
                      <span
                        className="w-3.5 h-3.5 block rounded-full"
                        style={{ backgroundColor: board.color }}
                      ></span>
                      {board.value}
                    </dd>
                  </div>
                ))}
              </div>
              <div>
                {boardsByStatus.map((board) => (
                  <div
                    key={board.name}
                    className="flex items-center gap-2 flex-row-reverse justify-end"
                  >
                    <dt className="text-muted-foreground">{board.name}</dt>
                    <dd className="flex items-center gap-2 font-mono">
                      <span
                        className="w-3.5 h-3.5 block rounded-full"
                        style={{ backgroundColor: board.color }}
                      ></span>
                      {board.value}
                    </dd>
                  </div>
                ))}
              </div>
            </dl>
          </div>
          <div className="col-span-1 border p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-muted-foreground">Tasks</h3>
              <dl className="flex items-center gap-1.5 font-bold text-xl">
                <dt>Total</dt>
                <span>:</span>
                <dd>{dashboardData.totalTasks}</dd>
              </dl>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    isAnimationActive={true}
                    data={tasks}
                    cx="50%"
                    cy="50%"
                    outerRadius="85%"
                    fill="#8884d8"
                    label
                  >
                    {tasks.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      fontSize: "16px",
                      fontWeight: 500,
                      paddingTop: 2,
                      paddingBottom: 2,
                      borderRadius: 6,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <dl className="grid grid-cols-2">
              {tasks.map((task) => (
                <div
                  key={task.name}
                  className="flex items-center gap-2 flex-row-reverse justify-end"
                >
                  <dt className="text-muted-foreground">{task.name}</dt>
                  <dd className="flex items-center gap-2 font-mono">
                    <span
                      className="w-3.5 h-3.5 block rounded-full"
                      style={{ backgroundColor: task.color }}
                    ></span>
                    {task.value}
                  </dd>
                </div>
              ))}
            </dl>
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
                        <AvatarImage
                          src={userData.photo || ""}
                          className="object-cover"
                        />
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

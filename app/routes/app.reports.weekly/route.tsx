import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
  generateWeeklyReportData,
  groupSerializeTimeTrackerByWeeks,
} from "./utils";
import { getUserTrackersInAYear } from "~/services/task-tracker.server";
import WeeklyChart from "./weekly-chart";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const userId = url.searchParams.get("userId");
  const year = Number(url.searchParams.get("year") || new Date().getFullYear());

  if (userId) {
    const userTrackers = await getUserTrackersInAYear({
      ownerId: userId,
      year,
    });
    return json({ userTrackers, year });
  } else {
    return json({ userTrackers: null, year });
  }
}

export default function WeeklyReport() {
  const { userTrackers, year } = useLoaderData<typeof loader>();

  if (!userTrackers) {
    return (
      <div className="border rounded-md flex-1 flex items-center justify-center h-52">
        <p className="text-center text-muted-foreground">Select user</p>
      </div>
    );
  }

  const groupedTrackers = groupSerializeTimeTrackerByWeeks(userTrackers);
  const data = generateWeeklyReportData({ groupedTrackers, year });

  return (
    <div className="border rounded-md ">
      <p className="py-3 flex gap-2 justify-center font-semibold">{year}</p>
      <div className="py-4 pr-4">
        <WeeklyChart data={data} />
      </div>
    </div>
  );
}

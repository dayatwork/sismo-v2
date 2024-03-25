import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
  generateMonthlyReportData,
  groupSerializeTimeTrackerByMonths,
} from "./utils";
import MonthlyChart from "./weekly-chart";
import { getUserTrackersInAYear } from "~/services/time-tracker.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const userId = url.searchParams.get("userId");
  const year = Number(url.searchParams.get("year") || new Date().getFullYear());

  if (userId) {
    const userTrackers = await getUserTrackersInAYear({
      userId,
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

  const groupedTrackers = groupSerializeTimeTrackerByMonths(userTrackers);
  const data = generateMonthlyReportData({ groupedTrackers, year });

  return (
    <div className="border rounded-md ">
      <p className="py-3 flex gap-2 justify-center font-semibold">{year}</p>
      <div className="py-4 pr-4">
        <MonthlyChart data={data} />
      </div>
    </div>
  );
}

import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";

import {
  generateDailyReportData,
  groupSerializeTimeTrackerByDays,
} from "./utils";
import DailyChart from "./daily-chart";
import { getUserTrackersInAYear } from "~/services/task-tracker.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const userId = url.searchParams.get("userId");
  const month = Number(url.searchParams.get("month") || new Date().getMonth());
  const year = Number(url.searchParams.get("year") || new Date().getFullYear());

  if (userId) {
    const userTrackers = await getUserTrackersInAYear({
      ownerId: userId,
      year,
    });
    return json({ userTrackers, year, month });
  } else {
    return json({ userTrackers: null, year, month });
  }
}

export default function DailyReport() {
  const { userTrackers, month, year } = useLoaderData<typeof loader>();

  if (!userTrackers) {
    return (
      <div className="border rounded-md flex-1 flex items-center justify-center h-52">
        <p className="text-center text-muted-foreground">Select user</p>
      </div>
    );
  }

  const groupedTrackers = groupSerializeTimeTrackerByDays(userTrackers);
  const data = generateDailyReportData({ groupedTrackers, year, month });

  return (
    <div className="border rounded-md ">
      <p className="py-3 flex gap-2 justify-center font-semibold">
        {dayjs().month(month).format("MMMM")} {year}
      </p>
      <div className="py-4 pr-4">
        <DailyChart data={data} />
      </div>
    </div>
  );
}

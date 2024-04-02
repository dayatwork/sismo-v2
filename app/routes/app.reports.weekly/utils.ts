import { type SerializeFrom } from "@remix-run/node";
import dayjs from "dayjs";

import { getTotalWeeksInYear } from "~/utils/datetime";

type Tracker = {
  id: string;
  startAt: string;
  endAt: string | null;
  week: number;
  year: number;
};

export function groupSerializeTimeTrackerByWeeks(
  timeRanges: SerializeFrom<Tracker[]>
): {
  [week: string]: SerializeFrom<Tracker[]>;
} {
  const groupedTimes: { [week: string]: SerializeFrom<Tracker[]> } = {};

  timeRanges.forEach((timeRange) => {
    if (!groupedTimes[timeRange.week]) {
      groupedTimes[timeRange.week] = [];
    }

    groupedTimes[timeRange.week].push(timeRange);
  });

  return groupedTimes;
}

type GroupedTrackers = ReturnType<typeof groupSerializeTimeTrackerByWeeks>;

export function generateWeeklyReportData({
  groupedTrackers,
  year,
}: {
  groupedTrackers: GroupedTrackers;
  year: number;
}) {
  const totalWeeksInYear = getTotalWeeksInYear(year);

  const weeksArray = Array.from({ length: totalWeeksInYear }, (_, i) => i + 1);

  const data = weeksArray.map((week) => {
    if (!groupedTrackers[week]) {
      return { week: week, workingHours: 0, fill: "#f97316" };
    }

    const workingMinutes = groupedTrackers[week].reduce((acc, curr) => {
      const startTime = dayjs(curr.startAt);
      const endTime = dayjs(curr.endAt!);
      const _workingMinutes = endTime.diff(startTime, "minutes");

      return acc + _workingMinutes;
    }, 0);

    return {
      week,
      workingHours: (workingMinutes / 60).toFixed(1),
      fill: workingMinutes / 60 >= 8 ? "#22c55e" : "#f97316",
    };
  });

  return data;
}

export type WeeklyReportData = ReturnType<typeof generateWeeklyReportData>;

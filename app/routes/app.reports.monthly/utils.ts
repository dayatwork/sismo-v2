import { type SerializeFrom } from "@remix-run/node";
import dayjs from "dayjs";

type Tracker = {
  id: string;
  startAt: string;
  endAt: string | null;
  week: number;
  year: number;
};

export function groupSerializeTimeTrackerByMonths(
  timeRanges: SerializeFrom<Tracker[]>
): {
  [month: string]: SerializeFrom<Tracker[]>;
} {
  const groupedTimes: { [month: string]: SerializeFrom<Tracker[]> } = {};

  timeRanges.forEach((timeRange) => {
    if (!groupedTimes[dayjs(timeRange.startAt).get("month")]) {
      groupedTimes[dayjs(timeRange.startAt).get("month")] = [];
    }

    groupedTimes[dayjs(timeRange.startAt).get("month")].push(timeRange);
  });

  return groupedTimes;
}

type GroupedTrackers = ReturnType<typeof groupSerializeTimeTrackerByMonths>;

export function generateMonthlyReportData({
  groupedTrackers,
  year,
}: {
  groupedTrackers: GroupedTrackers;
  year: number;
}) {
  const monthsArray = Array.from(Array(12).keys());

  const data = monthsArray.map((month) => {
    if (!groupedTrackers[month]) {
      return {
        month: dayjs().month(month).format("MMM"),
        workingHours: 0,
        fill: "#f97316",
      };
    }

    const workingMinutes = groupedTrackers[month].reduce((acc, curr) => {
      const startTime = dayjs(curr.startAt);
      const endTime = dayjs(curr.endAt!);
      const _workingMinutes = endTime.diff(startTime, "minutes");

      return acc + _workingMinutes;
    }, 0);

    return {
      month: dayjs().month(month).format("MMM"),
      workingHours: (workingMinutes / 60).toFixed(1),
      fill: workingMinutes / 60 >= 8 ? "#22c55e" : "#f97316",
    };
  });

  return data;
}

export type MonthlyReportData = ReturnType<typeof generateMonthlyReportData>;

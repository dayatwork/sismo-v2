import { type SerializeFrom } from "@remix-run/node";
import dayjs from "dayjs";

type Tracker = {
  id: string;
  startAt: string;
  endAt: string | null;
};

export function groupSerializeTimeTrackerByDays(
  timeRanges: SerializeFrom<Tracker[]>
): {
  [date: string]: SerializeFrom<Tracker[]>;
} {
  const groupedTimes: { [date: string]: SerializeFrom<Tracker[]> } = {};

  timeRanges.forEach((timeRange) => {
    const dateKey = dayjs(timeRange.startAt).format("YYYY-MM-DD");
    if (!groupedTimes[dateKey]) {
      groupedTimes[dateKey] = [];
    }

    groupedTimes[dateKey].push(timeRange);
  });

  return groupedTimes;
}

type GroupedTrackers = ReturnType<typeof groupSerializeTimeTrackerByDays>;

export function generateDailyReportData({
  groupedTrackers,
  month,
  year,
}: {
  groupedTrackers: GroupedTrackers;
  month: number;
  year: number;
}) {
  if (month < 0 || month > 11) return null;

  const datesArray = [];

  let startDate = dayjs().year(year).month(month).date(1);

  let currentDate = startDate;

  while (currentDate.month() === month) {
    datesArray.push(currentDate.format("YYYY-MM-DD"));
    currentDate = currentDate.add(1, "day");
  }

  const data = datesArray.map((date) => {
    if (!groupedTrackers[date]) {
      return { date: date.substring(8, 10), workingHours: 0, fill: "#f97316" };
    }

    const workingMinutes = groupedTrackers[date].reduce((acc, curr) => {
      const startTime = dayjs(curr.startAt);
      const endTime = dayjs(curr.endAt!);
      const _workingMinutes = endTime.diff(startTime, "minutes");

      return acc + _workingMinutes;
    }, 0);

    return {
      date: date.substring(8, 10),
      workingHours: (workingMinutes / 60).toFixed(1),
      fill: workingMinutes / 60 >= 8 ? "#22c55e" : "#f97316",
    };
  });

  return data;
}

export type DailyReportData = ReturnType<typeof generateDailyReportData>;

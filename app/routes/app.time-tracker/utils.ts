import dayjs from "dayjs";
import { type SerializeFrom } from "@remix-run/node";

import { type CompletedTracker } from "./type";

export function groupTimeTrackerByDays(trackers: CompletedTracker[]): {
  [date: string]: CompletedTracker[];
} {
  const groupedTimes: { [date: string]: CompletedTracker[] } = {};

  trackers.forEach((tracker) => {
    const dateKey = dayjs(tracker.startAt).format("YYYY-MM-DD");

    if (!groupedTimes[dateKey]) {
      groupedTimes[dateKey] = [];
    }

    groupedTimes[dateKey].push(tracker);
  });

  return groupedTimes;
}

export function getTotalDurationInMs(
  trackers: SerializeFrom<CompletedTracker>[]
) {
  return trackers.reduce((currDuration, timeTracker) => {
    return (
      dayjs(timeTracker.endAt).diff(dayjs(timeTracker.startAt)) + currDuration
    );
  }, 0);
}

export function groupSerializeTimeTrackerByDays(
  timeRanges: SerializeFrom<CompletedTracker[]>
): {
  [date: string]: SerializeFrom<CompletedTracker[]>;
} {
  const groupedTimes: { [date: string]: SerializeFrom<CompletedTracker[]> } =
    {};

  timeRanges.forEach((timeRange) => {
    const dateKey = dayjs(timeRange.startAt).format("YYYY-MM-DD");
    if (!groupedTimes[dateKey]) {
      groupedTimes[dateKey] = [];
    }

    groupedTimes[dateKey].push(timeRange);
  });

  return groupedTimes;
}

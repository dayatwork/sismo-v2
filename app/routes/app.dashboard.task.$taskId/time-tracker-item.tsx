import dayjs from "dayjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

interface TimeTrackerItemProps {
  last: boolean;
  percentage: number;
  startAt: string;
  endAt: string;
  note: string;
}

export function TimeTrackerItem({
  endAt,
  last = false,
  percentage,
  startAt,
  note,
}: TimeTrackerItemProps) {
  return (
    <div className={cn("relative", last ? "pb-0" : "pb-8")}>
      {!last && (
        <span
          className="absolute left-5 top-4 -ml-px h-full w-0.5 bg-slate-600"
          aria-hidden="true"
        ></span>
      )}
      <div className="relative flex space-x-3">
        <div>
          <span
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center ring-4 bg-background font-bold text-sm",
              percentage > 80
                ? "text-green-600 ring-green-600"
                : percentage > 70
                ? "text-blue-600 ring-blue-600"
                : percentage > 50
                ? "text-orange-600 ring-orange-600"
                : "text-red-600 ring-red-600"
            )}
          >
            {percentage}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 items-start justify-between">
          <div>
            <div className="whitespace-nowrap space-x-2 text-sm">
              <time dateTime={startAt}>
                {dayjs(startAt).format("MMM D, YYYY HH:mm")}
              </time>
              <span>-</span>
              <time dateTime={endAt}>
                {dayjs(endAt).format("MMM D, YYYY HH:mm")}
              </time>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-muted-foreground max-w-xs truncate">
                    Note : {note || "-"}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="text-sm max-w-xs">
                  {note}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="font-semibold text-sm">
            {Math.floor(
              (new Date(endAt).getTime() - new Date(startAt).getTime()) /
                (1000 * 60)
            )}{" "}
            minutes
          </p>
        </div>
      </div>
    </div>
  );
}

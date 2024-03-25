import { cn } from "~/lib/utils";

interface Props {
  eightWorkingHoursFulfilled: boolean;
  totalDuration: string;
}

export function TotalWorkingHours({
  eightWorkingHoursFulfilled = false,
  totalDuration,
}: Props) {
  const haveNotStarted = totalDuration === "00:00:00";
  return (
    <dl
      className={cn(
        eightWorkingHoursFulfilled
          ? "bg-green-100 border-green-700 dark:bg-green-800 dark:border-green-600 border-solid"
          : "bg-orange-100 border-orange-700 dark:bg-orange-800 dark:border-orange-600  border-dashed",
        haveNotStarted &&
          "bg-transparent dark:bg-transparent border-border dark:border-border text-primary",
        "flex flex-row md:flex-col items-center justify-between md:justify-center px-4 lg:px-6 py-2 rounded-lg border-2"
      )}
    >
      <dd className="font-semibold text-base lg:text-lg">
        You have worked for{" "}
      </dd>
      <dt
        className={cn(
          eightWorkingHoursFulfilled
            ? "text-green-700 dark:text-green-100"
            : "text-orange-700 dark:text-orange-100",
          haveNotStarted && "text-muted-foreground dark:text-muted-foreground",
          "font-bold text-xl md:text-2xl lg:text-3xl"
        )}
      >
        {totalDuration}
      </dt>
    </dl>
  );
}

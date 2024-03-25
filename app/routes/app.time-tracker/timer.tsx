import { useState, useEffect } from "react";
import { Progress } from "~/components/ui/progress";

interface Props {
  startTime: string;
  completedDurationInMs?: number;
}

const EIGHT_HOURS_IN_SECOND = 28800;

export default function Timer({
  startTime,
  completedDurationInMs = 3600000,
}: Props) {
  const [start] = useState(new Date(startTime).getTime() / 1000);
  const [now, setNow] = useState(start);
  const counter = now - start;

  const progress =
    ((counter + completedDurationInMs / 1000) / EIGHT_HOURS_IN_SECOND) * 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now() / 1000 + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex-1 flex gap-4 lg:gap-6 items-center">
      {counter > 0 ? (
        <p className="flex text-3xl md:text-4xl  xl:text-5xl font-bold">
          <span>{("0" + Math.floor((counter / 3600) % 60)).slice(-2)}:</span>
          <span>{("0" + Math.floor((counter / 60) % 60)).slice(-2)}:</span>
          <span>{("0" + Math.floor((counter / 1) % 60)).slice(-2)}</span>
        </p>
      ) : (
        <p className="flex text-5xl font-bold">
          <span>00:</span>
          <span>00:</span>
          <span>00</span>
        </p>
      )}
      <div className="flex-1">
        <Progress
          value={progress}
          className="h-2 md:h-3 lg:h-4 flex-1 mt-2 w-full"
        />
      </div>
    </div>
  );
}

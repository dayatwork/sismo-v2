import { useState, useEffect } from "react";
import { cn } from "~/lib/utils";

interface Props {
  startTime: string;
  size?: "normal" | "small";
  color?: "default" | "green";
  align?: "default" | "center";
}

export default function Timer({
  startTime,
  color = "default",
  size = "normal",
  align = "default",
}: Props) {
  const [start] = useState(new Date(startTime).getTime() / 1000);
  const [now, setNow] = useState(start);
  const counter = now - start;

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now() / 1000 + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={cn(
        "flex-1 flex gap-4 lg:gap-6 items-center",
        align === "center" && "justify-center"
      )}
    >
      {counter > 0 ? (
        <p
          className={cn(
            "flex font-bold",
            size === "small" ? "text-lg" : "text-2xl",
            color === "green" && "text-green-600"
          )}
        >
          <span>{("0" + Math.floor((counter / 3600) % 60)).slice(-2)}:</span>
          <span>{("0" + Math.floor((counter / 60) % 60)).slice(-2)}:</span>
          <span>{("0" + Math.floor((counter / 1) % 60)).slice(-2)}</span>
        </p>
      ) : (
        <p
          className={cn(
            "flex font-bold",
            size === "small" ? "text-lg" : "text-2xl",
            color === "green" && "text-green-600"
          )}
        >
          <span>00:</span>
          <span>00:</span>
          <span>00</span>
        </p>
      )}
    </div>
  );
}

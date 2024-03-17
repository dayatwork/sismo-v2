import { useState, useEffect } from "react";
import { ClientOnly } from "remix-utils/client-only";

export function CurrentDateTime() {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ClientOnly fallback={null}>
      {() => (
        <time
          className="hidden xl:block text-sm xl:text-lg font-bold mr-4 whitespace-nowrap"
          dateTime={time.toISOString()}
        >
          {time.toLocaleString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </time>
      )}
    </ClientOnly>
  );
}

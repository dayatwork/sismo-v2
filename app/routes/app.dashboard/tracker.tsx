import { useState, useEffect } from "react";

interface Props {
  startTime: string;
}

export default function Tracker({ startTime }: Props) {
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
    </div>
  );
}

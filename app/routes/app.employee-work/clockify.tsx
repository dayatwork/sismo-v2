import dayjs from "dayjs";
import { Separator } from "~/components/ui/separator";
import { millisecondsToHHMMSS } from "~/utils/datetime";

interface Props {
  startAt: string;
  endAt: string;
}

export function Clockify({ startAt, endAt }: Props) {
  return (
    <dl className="flex items-center md:gap-6 px-4">
      <Separator orientation="vertical" className="h-9" />
      <div>
        <dt className="font-semibold text-muted-foreground text-sm">
          Clock-in
        </dt>
        <dd className="font-bold">
          {dayjs(new Date(startAt)).format("HH:mm:ss")}
        </dd>
      </div>
      <Separator orientation="vertical" className="h-9" />
      <div>
        <dt className="font-semibold text-muted-foreground text-sm">
          Clock-out
        </dt>
        <dd className="font-bold">
          {dayjs(new Date(endAt)).format("HH:mm:ss")}
        </dd>
      </div>
      <Separator orientation="vertical" className="h-9" />
      <div className="hidden md:block">
        <dt className="font-semibold text-muted-foreground text-sm">
          Duration
        </dt>
        <dd className="font-bold">
          {millisecondsToHHMMSS(dayjs(endAt).diff(dayjs(startAt)))}
        </dd>
      </div>
    </dl>
  );
}

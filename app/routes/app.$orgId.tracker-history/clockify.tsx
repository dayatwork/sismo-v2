import dayjs from "dayjs";
import { Separator } from "~/components/ui/separator";
import { millisecondsToHHMMSS } from "~/utils/datetime";

interface Props {
  startAt: string;
  endAt: string;
}

export function Clockify({ startAt, endAt }: Props) {
  return (
    <dl className="flex gap-4 md:gap-6 mr-4">
      <div className="">
        <dt className="font-semibold text-muted-foreground text-sm">
          Clock-in
        </dt>
        <dd className="md:text-lg font-bold">
          {dayjs(new Date(startAt)).format("HH:mm:ss")}
        </dd>
      </div>
      <Separator orientation="vertical" className="h-12" />
      <div className="">
        <dt className="font-semibold text-muted-foreground text-sm">
          Clock-out
        </dt>
        <dd className="md:text-lg font-bold">
          {dayjs(new Date(endAt)).format("HH:mm:ss")}
        </dd>
      </div>
      <Separator orientation="vertical" className="h-12" />
      <div className="hidden md:block ">
        <dt className="font-semibold text-muted-foreground text-sm">
          Duration
        </dt>
        <dd className="md:text-lg font-bold">
          {millisecondsToHHMMSS(dayjs(endAt).diff(dayjs(startAt)))}
        </dd>
      </div>
    </dl>
  );
}

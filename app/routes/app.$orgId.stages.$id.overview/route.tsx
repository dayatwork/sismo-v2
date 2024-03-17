import { useOutletContext } from "@remix-run/react";

import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { type StageStatus, stageStatusColor } from "~/utils/stage";

type Context = {
  stage: {
    id: string;
    name: string;
    project: {
      id: string;
      name: string;
    };
    status: string;
  };
};

export default function StageOverview() {
  const { stage } = useOutletContext<Context>();

  return (
    <div className="-mt-px border rounded-b-md rounded-tr-md bg-neutral-50 dark:bg-neutral-900">
      <div className="py-2 px-6 flex justify-between items-center">
        <h2 className="font-semibold text-primary">Overview</h2>
        {/* <Button variant="outline">Action</Button> */}
      </div>
      <Separator />
      <dl className="py-4 px-6 space-y-4 text-sm">
        <div className="flex items-center">
          <dt className="w-36 text-muted-foreground">Project Name</dt>
          <dd className="capitalize font-semibold">{stage.project.name}</dd>
        </div>
        <div className="flex items-center">
          <dt className="w-36 text-muted-foreground">Stage</dt>
          <dd className="capitalize font-semibold">{stage.name}</dd>
        </div>
        <div className="flex items-center">
          <dt className="w-36 text-muted-foreground">Stage Status</dt>
          <dd className="capitalize font-semibold">
            <Badge
              className="uppercase -ml-1"
              variant={stageStatusColor[stage.status as StageStatus]}
            >
              {stage.status}
            </Badge>
          </dd>
        </div>
      </dl>
    </div>
  );
}

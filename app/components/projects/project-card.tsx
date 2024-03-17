import {
  BadgeCheckIcon,
  BoxesIcon,
  LayoutGridIcon,
  QrCodeIcon,
  TrophyIcon,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Badge } from "../ui/badge";
import {
  type ProjectStatus,
  projectStatusColor,
  projectStatuses,
} from "~/utils/project";
import { Separator } from "../ui/separator";
import { cn } from "~/lib/utils";

interface Props {
  name: string;
  status: string;
  description?: string;
  code?: string;
  service?: {
    id: string;
    name: string;
  } | null;
  product?: {
    id: string;
    name: string;
  } | null;
  champion?: {
    id: string;
    name: string;
    photo?: string | null;
  } | null;
  bottom?: React.ReactNode;
  onClick?: () => void;
  animateWhenHover?: boolean;
}

export function ProjectCard({
  name,
  status,
  champion,
  code,
  description,
  product,
  service,
  bottom,
  onClick,
  animateWhenHover,
}: Props) {
  return (
    <div
      className={cn(
        "border rounded-md bg-neutral-50 dark:bg-neutral-900 group",
        bottom ? "pt-4" : "py-4",
        animateWhenHover &&
          "hover:shadow-xl dark:shadow-white/5 transition cursor-pointer"
      )}
    >
      <div className="px-6" onClick={onClick}>
        <h1 className="text-xl font-bold">{name}</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground truncate">
          {description}
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm font-semibold text-primary flex items-center gap-2">
            <QrCodeIcon className="w-5 h-5" />
            {code}
          </p>
          <p className="text-sm font-semibold text-primary flex items-center gap-2">
            <LayoutGridIcon className="w-5 h-5" />
            {service?.name || "-"}
          </p>
          <p className="text-sm font-semibold text-primary flex items-center gap-2">
            <BoxesIcon className="w-5 h-5" />
            {product?.name || "-"}
          </p>
          <p className="text-sm font-semibold text-primary flex items-center gap-2">
            <TrophyIcon className="w-5 h-5" />
            {champion?.name || "-"}
          </p>
        </div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <button className="mt-4 -ml-1">
              <Badge
                variant={projectStatusColor[status as ProjectStatus]}
                className="uppercase text-sm font-bold py-1 px-3"
              >
                {status.replace("_", " ")}
              </Badge>
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-52">
            <h3 className="capitalize font-semibold">{name} Status</h3>
            <Separator className="my-4" />
            <ul className="space-y-3 mb-3">
              {projectStatuses.map((projectStatus) => (
                <li key={projectStatus} className="flex items-center gap-4">
                  <Badge
                    variant={projectStatusColor[projectStatus]}
                    className="uppercase w-32 text-center justify-center"
                  >
                    {projectStatus.replace("_", " ")}
                  </Badge>
                  {projectStatus === status && (
                    <BadgeCheckIcon className="w-6 h-6 text-green-600" />
                  )}
                </li>
              ))}
            </ul>
          </HoverCardContent>
        </HoverCard>
      </div>
      {bottom ? (
        <div onClick={(e) => e.stopPropagation()}>
          <Separator className="mt-3" />
          {bottom}
        </div>
      ) : null}
    </div>
  );
}

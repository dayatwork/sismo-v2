import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { CrownIcon } from "lucide-react";

import Breadcrumbs from "~/components/ui/breadcrumbs";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import MainContainer from "~/components/main-container";
import { type StageStatus, stageStatusColor } from "~/utils/stage";
import { getStageById, isStageMember } from "~/services/stage.server";
import { requireUser } from "~/utils/auth.server";

const subPages = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "milestones",
    label: "Milestones",
  },
  {
    id: "tasks",
    label: "Tasks",
  },
  {
    id: "documents",
    label: "Documents",
  },
  {
    id: "members",
    label: "Members",
  },
];

export async function loader({ params, request }: LoaderFunctionArgs) {
  const stageId = params.id;
  if (!stageId) {
    return redirect(`/app/projects`);
  }

  const loggedInUser = await requireUser(request);

  if (!isStageMember({ stageId, userId: loggedInUser.id })) {
    return redirect(`/app`);
  }

  const stage = await getStageById({ id: stageId });

  if (!stage) {
    return redirect(`/app/projects`);
  }

  return json({ stage });
}

export default function StageDetails() {
  const { stage } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();

  return (
    <MainContainer>
      <Breadcrumbs
        pages={[
          { name: "Projects", href: `/app/projects`, current: false },
          {
            name: stage.project.name,
            href: `/app/projects/${stage.projectId}/stages`,
            current: false,
          },
          {
            name: stage.name.toUpperCase(),
            href: `/app/stages/${stage.id}`,
            current: true,
          },
        ]}
      />
      <div className="relative mt-8 py-4 px-6 border rounded-md flex items-center gap-10 bg-neutral-50 dark:bg-neutral-900">
        <div className="flex-1 flex gap-4">
          <p className="shadow text-lg font-bold bg-primary text-primary-foreground flex justify-center items-center w-8 h-8 rounded-xl">
            {stage.stageOrder}
          </p>
          <h1 className="text-xl font-bold capitalize">{stage.name} Stage</h1>
        </div>
        <ul className="flex gap-2">
          {stage.members.map((member) => (
            <li key={member.id}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar className="z-0">
                        <AvatarImage
                          className="object-cover"
                          src={member.user.photo || undefined}
                        />
                        <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                      </Avatar>
                      {member.role === "PIC" && (
                        <CrownIcon className="w-7 h-7 absolute -top-3 -right-2 z-10 bg-primary rounded-full p-1 border-2 border-background" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{member.user.name}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
        <div className="flex gap-4 items-center">
          <Badge
            className="uppercase text-sm font-bold py-1 px-3"
            variant={stageStatusColor[stage.status as StageStatus]}
          >
            {stage.status.replace("_", " ")}
          </Badge>
        </div>
      </div>
      <nav className="mt-4 inline-flex border rounded-t-md overflow-hidden bg-neutral-50 dark:bg-neutral-900">
        {subPages.map((subPage) => (
          <Link
            key={subPage.id}
            to={subPage.id}
            className={cn(
              pathname.endsWith(subPage.id)
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/80"
                : "hover:bg-primary/10",
              "border-r last:border-r-0 py-2 text-center font-semibold px-6"
            )}
          >
            {subPage.label}
          </Link>
        ))}
      </nav>

      <Outlet context={{ stage }} />
    </MainContainer>
  );
}

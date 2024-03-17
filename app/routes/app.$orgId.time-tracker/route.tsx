import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useNavigate } from "@remix-run/react";
import dayjs from "dayjs";
import {
  CalendarIcon,
  File,
  InfoIcon,
  LinkIcon,
  MoreVerticalIcon,
  PenSquare,
  Plus,
  TimerIcon,
  TimerOffIcon,
  Trash2Icon,
  Upload,
} from "lucide-react";

import MainContainer from "~/components/main-container";
import { authenticator } from "~/services/auth.server";
import { getOrganizationUser } from "~/services/user.server";
import { organizationUserToLoggedInUser } from "~/utils/auth.server";
import { type CompletedTracker, type IncompletedTracker } from "./type";
import {
  checkAllowClockIn,
  getUserTimeTrackers,
} from "~/services/time-tracker.server";
import { groupSerializeTimeTrackerByDays } from "./utils";
import { millisecondsToHHMMSS } from "~/utils/datetime";
import Timer from "./timer";
import { TotalWorkingHours } from "./total-working-hours";
import { Separator } from "~/components/ui/separator";
// import { cn } from "~/lib/utils";
import { Clockify } from "./clockify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
// import { useRevalidateWhenFocus } from "~/hooks/useRevalidateWhenFocus";
import { getOrganizationSettings } from "~/services/organization.server";
// import { AttachmentsCard } from "./attachments-card";
import { useLiveLoader } from "~/utils/sse/use-live-loader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { cn } from "~/lib/utils";
import { AttachmentsCard } from "./attachments-card";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const { id: userId } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const organizationUser = await getOrganizationUser({
    organizationId,
    userId,
  });

  const loggedInUser = organizationUserToLoggedInUser(organizationUser);

  if (!loggedInUser) {
    return redirect("/app");
  }

  let completedTrackers: CompletedTracker[] = [];
  let incompletedTrackers: IncompletedTracker[] = [];

  const timeTrackers = await getUserTimeTrackers(
    organizationId,
    loggedInUser.id
  );

  timeTrackers.forEach((tracker) => {
    if (tracker.endAt) {
      completedTrackers.push({
        ...tracker,
        endAt: tracker.endAt,
        trackerItems: JSON.parse(JSON.stringify(tracker.trackerItems)),
        // task: JSON.parse(JSON.stringify(tracker.task)),
        // attachments: JSON.parse(JSON.stringify(tracker.attachments)),
      });
    } else {
      incompletedTrackers.push({
        ...tracker,
        endAt: null,
        trackerItems: JSON.parse(JSON.stringify(tracker.trackerItems)),
        // task: JSON.parse(JSON.stringify(tracker.task)),
      });
    }
  });

  const settings = await getOrganizationSettings(organizationId);
  const allowClockIn = await checkAllowClockIn({
    organizationId,
    userId: loggedInUser.id,
  });

  return json({
    timeTrackers,
    completedTrackers,
    incompletedTracker: incompletedTrackers?.[0] || null,
    settings,
    allowClockIn: settings?.requireUploadAttachmentBeforeClockIn
      ? allowClockIn
      : true,
  });
}

export default function AppTimeTracker() {
  // const { incompletedTracker, completedTrackers, settings, allowClockIn } =
  //   useLoaderData<typeof loader>();
  const { incompletedTracker, completedTrackers, settings, allowClockIn } =
    useLiveLoader<typeof loader>();
  const navigate = useNavigate();

  const groupedTimeTrackers =
    groupSerializeTimeTrackerByDays(completedTrackers);

  const todayTimeTrackers =
    groupedTimeTrackers[dayjs(new Date()).format("YYYY-MM-DD")] || [];

  const totalDurationInMs = todayTimeTrackers.reduce(
    (currDuration, timeTracker) => {
      return (
        dayjs(timeTracker.endAt).diff(dayjs(timeTracker.startAt)) + currDuration
      );
    },
    0
  );

  const eightWorkingHoursFulfilled = totalDurationInMs / 1000 >= 28800;
  const totalDuration = millisecondsToHHMMSS(totalDurationInMs);

  // useRevalidateWhenFocus();

  return (
    <MainContainer>
      <Outlet />
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Time Tracker</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-4 md:mb-6">
        {!incompletedTracker ? (
          <div className="flex-1 px-4 py-4 border-dashed border-2 flex items-center gap-10 rounded-lg">
            <div className="flex gap-4 items-center">
              <button
                onClick={() => navigate("clockin")}
                className="p-2 md:p-3 xl:p-4  bg-primary hover:bg-primary/90 font-bold text-primary-foreground flex flex-col gap-1 lg:gap-2 items-center rounded-lg transition cursor-pointer disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                disabled={!allowClockIn}
              >
                <TimerIcon className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                <span className="text-base md:text-lg lg:text-2xl font-bold">
                  Clock in
                </span>
              </button>
              {!allowClockIn && (
                <p className="text-destructive flex items-center font-semibold gap-2 text-sm first-letter:md:text-base">
                  <InfoIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Upload attachment before clock in!</span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 px-4 py-4 border-dashed border-2 border-primary bg-primary/10 rounded flex items-stretch justify-between gap-6 md:gap-8 xl:gap-10">
            <div className="flex-1 flex flex-col gap-4">
              {/* <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  {incompletedTracker.task.name}
                </h2>
                {incompletedTracker.task.project ? (
                  <p className="capitalize text-muted-foreground font-semibold">
                    {incompletedTracker.task.project.name}
                  </p>
                ) : null}
              </div> */}
              <Timer
                startTime={incompletedTracker.startAt}
                completedDurationInMs={totalDurationInMs}
              />
            </div>
            {/* <Form method="post">
                <input
                  type="hidden"
                  name="trackerId"
                  value={incompletedTracker.id}
                /> */}
            <Link
              to={`${incompletedTracker.id}/clockout`}
              className="p-2 md:p-3 xl:p-4 bg-destructive hover:bg-destructive/90 font-bold text-destructive-foreground flex flex-col gap-1 lg:gap-2 items-center rounded-lg transition cursor-pointer disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              <TimerOffIcon className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
              <span className="text-base md:text-lg lg:text-2xl font-bold">
                Clock out
              </span>
            </Link>
            {/* </Form> */}
          </div>
        )}
        <TotalWorkingHours
          eightWorkingHoursFulfilled={eightWorkingHoursFulfilled}
          totalDuration={totalDuration}
        />
      </div>
      {Object.keys(groupedTimeTrackers).length > 0 && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-bold text-primary">Tracker History</h2>
            <p className="font-semibold px-2">Last 10 trackers</p>
          </div>
          <Separator />
        </>
      )}

      <div className="mt-4">
        {Object.keys(groupedTimeTrackers).map((day) => (
          <div key={day} className="mb-4">
            <div className="mb-2 flex gap-2 items-center">
              <CalendarIcon className="w-5 h-5" />
              <time dateTime={day} className="block font-semibold text-lg">
                {dayjs(day).format("dddd MMM D, YYYY")}
              </time>
            </div>
            <Accordion type="multiple" className="space-y-2">
              {groupedTimeTrackers[day].map((timeTracker) => (
                <AccordionItem
                  key={timeTracker.startAt}
                  value={timeTracker.id}
                  className="border-none"
                >
                  <div className="flex items-center justify-between gap-2 px-3 py-2 lg:px-4 lg:py-3 border rounded bg-neutral-50 dark:bg-neutral-900">
                    {/* <div className="flex-1 flex gap-4">
                    <p
                      className={cn(
                        timeTracker.taskCompletion > 80
                          ? "text-green-600"
                          : timeTracker.taskCompletion > 70
                          ? "text-blue-600"
                          : timeTracker.taskCompletion > 50
                          ? "text-orange-600"
                          : "text-red-600",
                        "rounded w-16 flex items-center justify-center border font-bold text-lg"
                      )}
                    >
                      {timeTracker.taskCompletion}%
                    </p>
                    <div>
                      <Link
                        to={`/app/stages/${timeTracker.task.stageId}/tasks/${timeTracker.task.id}/details`}
                        className="text-lg font-bold hover:text-primary hover:underline"
                      >
                        {timeTracker.task.name}
                      </Link>
                      <div className="text-sm flex gap-1">
                        {timeTracker.task.project ? (
                          <Link
                            to={`/app/projects/${timeTracker.task.projectId}`}
                            className="hover:text-indigo-700 hover:underline font-semibold capitalize text-indigo-600"
                          >
                            {timeTracker.task.project.name}
                          </Link>
                        ) : (
                          <span className="text-cyan-600 font-semibold">
                            Personal
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Note : {timeTracker.note || "-"}
                      </p>
                    </div>
                  </div> */}
                    <AccordionTrigger className="w-[120px] border bg-background py-1.5 px-4 rounded-md hover:no-underline hover:bg-accent text-lg font-semibold">
                      <span
                        className={cn(
                          "mr-1",
                          timeTracker.trackerItems.length === 0
                            ? "text-red-600"
                            : "text-green-600"
                        )}
                      >
                        {timeTracker.trackerItems.length}
                      </span>
                      <span>
                        {timeTracker.trackerItems.length === 1
                          ? "Task"
                          : "Tasks"}
                      </span>
                    </AccordionTrigger>
                    <div className="flex gap-10 items-center">
                      {/* <AttachmentsCard
                      timeTrackerId={timeTracker.id}
                      attachments={timeTracker.attachments}
                    /> */}
                      <Clockify
                        startAt={timeTracker.startAt}
                        endAt={timeTracker.endAt}
                      />
                      {/* <div className="font-semibold px-3 py-1 rounded-md border">
                        {dayjs(timeTracker.endAt).diff(
                          timeTracker.startAt,
                          "minutes"
                        )}{" "}
                        min
                      </div> */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-9 w-9 flex items-center justify-center border border-transparent hover:border-border rounded">
                          <span className="sr-only">Open</span>
                          <MoreVerticalIcon className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Action</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => navigate(`${timeTracker.id}/items`)}
                          >
                            <Plus className="mr-2 w-4 h-4" />
                            Set tasks
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            onClick={() => navigate(`${timeTracker.id}/upload`)}
                          >
                            <Upload className="mr-2 w-4 h-4" />
                            Upload File
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`${timeTracker.id}/add-link`)
                            }
                          >
                            <LinkIcon className="mr-2 w-4 h-4" />
                            Add Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`${timeTracker.id}/add-document`)
                            }
                          >
                            <File className="mr-2 w-4 h-4" />
                            Add Document
                          </DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => navigate(`${timeTracker.id}/edit`)}
                            disabled={
                              !settings?.allowEditTimeTracker ||
                              new Date(timeTracker.startAt).getTime() <
                                dayjs(new Date())
                                  .subtract(
                                    settings.timeTrackerEditLimitInDays || 1,
                                    "day"
                                  )
                                  .toDate()
                                  .getTime()
                            }
                          >
                            <PenSquare className="w-4 h-4 mr-2" />
                            <span className="pr-2">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => navigate(`${timeTracker.id}/delete`)}
                            disabled={
                              new Date(timeTracker.startAt).getTime() <
                              dayjs(new Date())
                                .subtract(
                                  settings?.timeTrackerEditLimitInDays || 1,
                                  "day"
                                )
                                .toDate()
                                .getTime()
                            }
                          >
                            <Trash2Icon className="w-4 h-4 mr-2" />
                            <span className="pr-2">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <AccordionContent className="border-none">
                    {timeTracker.trackerItems.length === 0 && (
                      <div className="mt-2 ml-4 border px-4 py-2 rounded bg-neutral-50 dark:bg-neutral-900 flex justify-center items-center">
                        <p className="text-red-600">
                          No task attach to this tracker. Please{" "}
                          <Link
                            to={`${timeTracker.id}/items`}
                            className="underline hover:text-red-800 dark:hover:text-red-300"
                          >
                            set task
                          </Link>{" "}
                          for this tracker
                        </p>
                      </div>
                    )}
                    <ul className="ml-4 mt-2">
                      {timeTracker.trackerItems.map((trackerItem) => (
                        <li
                          key={trackerItem.id}
                          className="border px-4 py-2 rounded bg-neutral-50 dark:bg-neutral-900 flex justify-between items-center"
                        >
                          <div className="flex gap-4">
                            <div className="text-base font-bold border rounded-md w-14 flex items-center justify-center bg-background">
                              {trackerItem.taskCompletion}%
                            </div>
                            <div>
                              <p className="font-semibold text-base">
                                {trackerItem.task.name}
                              </p>
                              <p className="text-muted-foreground">
                                Note: {trackerItem.note || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-10 items-center">
                            <AttachmentsCard
                              timeTrackerId={timeTracker.id}
                              attachments={trackerItem.attachments}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger className="h-9 w-9 flex items-center justify-center border border-transparent hover:border-border rounded">
                                <span className="sr-only">Open</span>
                                <MoreVerticalIcon className="w-4 h-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  Attachment
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(
                                      `${timeTracker.id}/items/${trackerItem.id}/upload`
                                    )
                                  }
                                >
                                  <Upload className="mr-2 w-4 h-4" />
                                  Upload File
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(
                                      `${timeTracker.id}/items/${trackerItem.id}/add-link`
                                    )
                                  }
                                >
                                  <LinkIcon className="mr-2 w-4 h-4" />
                                  Add Link
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(
                                      `${timeTracker.id}/items/${trackerItem.id}/add-document`
                                    )
                                  }
                                >
                                  <File className="mr-2 w-4 h-4" />
                                  Add Document
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </MainContainer>
  );
}

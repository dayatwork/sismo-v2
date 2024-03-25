import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";

import MainContainer from "~/components/main-container";
import { getTimeTrackers } from "~/services/time-tracker.server";
import { cn } from "~/lib/utils";
import { Clockify } from "./clockify";
import { useRevalidateWhenFocus } from "~/hooks/useRevalidateWhenFocus";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Calendar } from "~/components/ui/calendar";
import { requirePermission } from "~/utils/auth.server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { AttachmentsCard } from "../app.time-tracker/attachments-card";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:employee");

  const url = new URL(request.url);

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!dayjs(from).isValid() || !dayjs(to).isValid()) {
    return json({ timeTrackers: null });
  }

  try {
    const timeTrackers = await getTimeTrackers({
      from,
      to,
    });

    return json({
      timeTrackers,
    });
  } catch (error) {
    return json({ timeTrackers: null });
  }
}

export default function AppTimeTracker() {
  const { timeTrackers } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  useRevalidateWhenFocus();

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    const from = date;
    const to = dayjs(date).add(1, "day");
    setSearchParams((prev) => {
      prev.set("from", from.toISOString());
      prev.set("to", to.toISOString());
      return prev;
    });
  };

  const from = searchParams.get("from");

  if (!timeTrackers) {
    return (
      <MainContainer>
        <Outlet />
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Employee Work</h1>
        </div>

        <div className="mt-4 flex items-start gap-4">
          <Calendar
            mode="single"
            className="rounded-md border bg-neutral-50 dark:bg-neutral-900"
            selected={from ? new Date(from) : new Date()}
            onSelect={handleSelectDate}
          />

          <div className="border rounded-md flex-1 flex items-center justify-center h-52 border-dashed">
            <p className="text-center text-muted-foreground">Select date</p>
          </div>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Outlet />
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Employee Work</h1>
      </div>

      <div className="mt-4 flex items-start gap-4">
        <Calendar
          mode="single"
          className="rounded-md border bg-neutral-50 dark:bg-neutral-900"
          selected={from ? new Date(from) : new Date()}
          onSelect={handleSelectDate}
        />

        {timeTrackers.length > 0 ? (
          <Accordion type="multiple" className="space-y-2 flex-1">
            {timeTrackers.map((timeTracker) => (
              <AccordionItem
                key={timeTracker.startAt}
                value={timeTracker.id}
                className="border-none"
              >
                <div className="flex items-center gap-2 px-3 py-2 lg:px-4 border rounded bg-neutral-50 dark:bg-neutral-900">
                  <div className="flex-1 flex gap-4 justify-between">
                    <div className="flex gap-2 items-center">
                      <Avatar>
                        <AvatarImage
                          src={timeTracker.user.photo || ""}
                          alt={timeTracker.user.name}
                        />
                        <AvatarFallback>
                          {timeTracker.user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <p className="line-clamp-1 text-sm font-semibold">
                        {timeTracker.user.name}
                      </p>
                    </div>
                    <div className="flex gap-4 items-stretch">
                      <AccordionTrigger className="w-[100px] border bg-background py-1 px-3 rounded-md hover:no-underline hover:bg-accent font-semibold">
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
                    </div>
                  </div>
                  <Clockify
                    startAt={timeTracker.startAt}
                    endAt={timeTracker.endAt!}
                  />
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
                            <p className="font-semibold text-sm">
                              {trackerItem.task.name}
                            </p>
                            <p className="text-muted-foreground">
                              Note: {trackerItem.note || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-5 items-center">
                          <AttachmentsCard
                            timeTrackerId={timeTracker.id}
                            attachments={trackerItem.attachments}
                          />
                          {/* <DropdownMenu>
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
                            </DropdownMenu> */}
                        </div>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="border rounded-md flex-1 flex items-center justify-center h-52 bg-neutral-50 dark:bg-neutral-900">
            <p className="text-center text-muted-foreground">
              There is no tracker on {dayjs(from).format("MMM D, YYYY")}
            </p>
          </div>
        )}
      </div>
    </MainContainer>
  );
}

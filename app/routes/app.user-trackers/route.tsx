import {
  type LoaderFunctionArgs,
  json,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { Link, Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import { type Key } from "react-aria-components";

import MainContainer from "~/components/main-container";
import { Calendar } from "~/components/ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { UserComboBox } from "~/components/comboboxes/user-combobox";
import { useRevalidateWhenFocus } from "~/hooks/useRevalidateWhenFocus";
import { cn } from "~/lib/utils";
import { requireUser } from "~/utils/auth.server";
import {
  deleteTaskTracker,
  getTaskTrackers,
} from "~/services/task-tracker.server";
import { getUsers } from "~/services/user.server";
import { Clockify } from "./clockify";
import { AttachmentsCard } from "../app.time-tracker/attachments-card";
import { Badge } from "~/components/ui/badge";

export async function action({ request }: ActionFunctionArgs) {
  const loggedInUser = await requireUser(request);

  const formData = await request.formData();
  const _action = formData.get("_action");
  const trackerId = formData.get("trackerId");

  if (_action === "DELETE" && typeof trackerId === "string" && trackerId) {
    await deleteTaskTracker({
      trackerId,
      ownerId: loggedInUser.id,
    });
  }

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const userId = url.searchParams.get("userId");

  const users = await getUsers();

  if (
    !dayjs(from).isValid() ||
    !dayjs(to).isValid() ||
    typeof userId !== "string"
  ) {
    return json({
      users,
      timeTrackers: null,
      appUrl: process.env.APP_URL || "http://localhost:5173",
    });
  }

  try {
    const timeTrackers = await getTaskTrackers({
      from,
      to,
      ownerId: userId,
    });

    return json({
      users,
      appUrl: process.env.APP_URL || "http://localhost:5173",
      timeTrackers,
    });
  } catch (error) {
    return json({
      users,
      timeTrackers: null,
      appUrl: process.env.APP_URL || "http://localhost:5173",
    });
  }
}

export default function UserTrackers() {
  const { timeTrackers, appUrl, users } = useLoaderData<typeof loader>();
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

  const handleSelectUser = (key: Key) => {
    setSearchParams((prev) => {
      prev.set("userId", key.toString());
      return prev;
    });
  };

  const userId = searchParams.get("userId");
  const from = searchParams.get("from");

  if (!timeTrackers) {
    return (
      <MainContainer>
        <Outlet />
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">User Trackers</h1>
          <UserComboBox
            hideLabel
            name="userId"
            users={users}
            handleSearchParam={handleSelectUser}
            defaultValue={userId || undefined}
          />
        </div>

        <div className="mt-4 flex items-start gap-4">
          <Calendar
            mode="single"
            className="rounded-md border bg-neutral-50 dark:bg-neutral-900"
            selected={from ? new Date(from) : undefined}
            onSelect={handleSelectDate}
          />

          <div className="border-2 rounded-xl flex-1 flex items-center justify-center h-52 border-dashed">
            <p className="text-center text-muted-foreground">
              Select date and user
            </p>
          </div>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Outlet />
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">User Trackers</h1>
        <UserComboBox
          hideLabel
          name="userId"
          users={users}
          handleSearchParam={handleSelectUser}
          defaultValue={userId || undefined}
        />
      </div>

      <div className="mt-4 flex items-start gap-4">
        <Calendar
          mode="single"
          className="rounded-md border bg-neutral-50 dark:bg-neutral-900"
          selected={from ? new Date(from) : new Date()}
          onSelect={handleSelectDate}
        />

        <div className="flex-1">
          {timeTrackers?.length > 0 ? (
            <Accordion type="multiple" className="space-y-2">
              {timeTrackers.map((timeTracker) => (
                <AccordionItem
                  key={timeTracker.startAt}
                  value={timeTracker.id}
                  className="border-none"
                >
                  <div className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-3 border rounded bg-neutral-50 dark:bg-neutral-900">
                    <div className="flex-1 flex gap-4">
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
                      <div></div>
                    </div>
                    {timeTracker.approved ? (
                      <Badge className="uppercase mx-6" variant="green">
                        Approved
                      </Badge>
                    ) : (
                      <Badge className="uppercase mx-6">Not Yet Approved</Badge>
                    )}
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
                              <p className="font-semibold text-base">
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
                              appUrl={appUrl}
                            />
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
              <p className="text-center text-muted-foreground text-sm">
                There is no tracker on {dayjs(from).format("MMM D, YYYY")}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainContainer>
  );
}

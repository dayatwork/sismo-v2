import {
  type LoaderFunctionArgs,
  json,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { Link, Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import { type Key } from "react-aria-components";

import MainContainer from "~/components/main-container";
import { requireUser } from "~/utils/auth.server";
import { cn } from "~/lib/utils";
import { Clockify } from "./clockify";
import { useRevalidateWhenFocus } from "~/hooks/useRevalidateWhenFocus";
import { Calendar } from "~/components/ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { AttachmentsCard } from "../app.time-tracker/attachments-card";
import {
  deleteTaskTracker,
  getTaskTrackers,
} from "~/services/task-tracker.server";
import { UserComboBox } from "~/components/comboboxes/user-combobox";
import { getUsers } from "~/services/user.server";

export async function action({ request, params }: ActionFunctionArgs) {
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

export async function loader({ request, params }: LoaderFunctionArgs) {
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
                      {/* <p
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
                    </p> */}
                      <div>
                        {/* <Link
                        to={`/app/tasks/${timeTracker.task.id}`}
                        className="font-bold hover:text-primary hover:underline line-clamp-1"
                      >
                        {timeTracker.task.name}
                      </Link>
                      <div className="text-sm flex gap-1">
                        {timeTracker.task.project ? (
                          <Link
                            to={`/app/projects/${timeTracker.task.project.id}`}
                            className="hover:text-indigo-700 hover:underline font-semibold capitalize text-indigo-600 line-clamp-1"
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
                      </p> */}
                      </div>
                    </div>
                    <Clockify
                      startAt={timeTracker.startAt}
                      endAt={timeTracker.endAt!}
                    />
                    {/* <DropdownMenu>
                      <DropdownMenuTrigger className="h-9 w-9 flex items-center justify-center border border-transparent hover:border-border rounded">
                        <span className="sr-only">Open</span>
                        <MoreVerticalIcon className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-red-600" asChild>
                          <Form method="post">
                            <input
                              type="hidden"
                              name="trackerId"
                              value={timeTracker.id}
                            />
                            <button
                              type="submit"
                              className="w-full cursor-pointer flex items-center gap-2 font-semibold"
                              name="_action"
                              value="DELETE"
                            >
                              <Trash2Icon className="w-4 h-4" />
                              <span className="pr-2">Delete</span>
                            </button>
                          </Form>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
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

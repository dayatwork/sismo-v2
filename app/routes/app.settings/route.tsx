import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import MainContainer from "~/components/main-container";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { getSettings, updateSettings } from "~/services/setting.server";
import { requirePermission } from "~/utils/auth.server";
import { redirectWithToast } from "~/utils/toast.server";

const schema = z.object({
  allowEditTimeTracker: zfd.checkbox(),
  timeTrackerEditLimitInDays: zfd.numeric(z.number().nonnegative()).optional(),
  timeTrackerLimited: zfd.checkbox(),
  maxTimeTrackerInHours: zfd.numeric(z.number().nonnegative()).optional(),
  allowClockinWithNewTask: zfd.checkbox(),
  allowClockinWithUnplannedTasks: zfd.checkbox(),
  requireUploadAttachmentBeforeClockIn: zfd.checkbox(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  await requirePermission(request, "manage:organization");

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const {
    allowClockinWithNewTask,
    allowClockinWithUnplannedTasks,
    allowEditTimeTracker,
    maxTimeTrackerInHours,
    timeTrackerEditLimitInDays,
    timeTrackerLimited,
    requireUploadAttachmentBeforeClockIn,
  } = submission.value;

  await updateSettings({
    allowClockinWithNewTask,
    allowClockinWithUnplannedTasks,
    allowEditTimeTracker,
    maxTimeTrackerInHours,
    timeTrackerEditLimitInDays,
    timeTrackerLimited,
    requireUploadAttachmentBeforeClockIn,
  });

  return redirectWithToast(`/app/settings`, {
    description: "Settings saved!",
    type: "success",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:organization");

  const settings = await getSettings();

  return json({ settings });
}

export default function OrganizationSettings() {
  const lastResult = useActionData<typeof action>();
  const { settings } = useLoaderData<typeof loader>();
  const [allowEdit, setAllowEdit] = useState(
    () => settings?.allowEditTimeTracker || false
  );
  const [enableLimit, setEnableLimit] = useState(
    () => settings?.timeTrackerLimited || false
  );
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
    defaultValue: {
      timeTrackerEditLimitInDays: settings?.timeTrackerEditLimitInDays,
      maxTimeTrackerInHours: settings?.maxTimeTrackerInHours,
    },
  });

  return (
    <MainContainer>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Manage your organization settings here
      </p>
      <Form method="POST" id={form.id} onSubmit={form.onSubmit}>
        <div className="rounded-md border py-4 bg-neutral-50 dark:bg-neutral-900">
          <div className="flex items-center justify-between space-x-2 px-6">
            <Label
              htmlFor="requireUploadAttachmentBeforeClockIn"
              className="flex flex-col space-y-1 cursor-pointer"
            >
              <span>Require upload attachments before clock-in</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Users must upload attachments for previous tracker before
                starting a new tracker
              </span>
            </Label>
            <Switch
              id="requireUploadAttachmentBeforeClockIn"
              name="requireUploadAttachmentBeforeClockIn"
              defaultChecked={settings?.requireUploadAttachmentBeforeClockIn}
            />
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between space-x-2 px-6">
            <Label
              htmlFor="allowEditTimeTracker"
              className="flex flex-col space-y-1 cursor-pointer"
            >
              <span>Allow edit time tracker</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Allow users to edit their tracker
              </span>
            </Label>
            <Switch
              id="allowEditTimeTracker"
              name="allowEditTimeTracker"
              defaultChecked={settings?.allowEditTimeTracker}
              checked={allowEdit}
              onCheckedChange={(c) => setAllowEdit(c)}
            />
          </div>
          {allowEdit && (
            <div className="mt-4 flex items-center justify-between space-x-2 px-6">
              <Label
                htmlFor="timeTrackerEditLimitInDays"
                className="flex flex-col space-y-1 cursor-pointer"
              >
                <span>Limit days</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Users can only edit the tracker within this time limit
                </span>
              </Label>
              <div className="flex items-center gap-2 relative">
                <Input
                  type="number"
                  className="w-[90px] pr-14 text-right font-semibold"
                  id="timeTrackerEditLimitInDays"
                  name="timeTrackerEditLimitInDays"
                  defaultValue={fields.timeTrackerEditLimitInDays.initialValue}
                />
                <span className="absolute right-4 text-sm font-semibold">
                  days
                </span>
              </div>
            </div>
          )}
          <Separator className="my-4" />
          <div className="flex items-center justify-between space-x-2 px-6">
            <Label
              htmlFor="timeTrackerLimited"
              className="flex flex-col space-y-1 cursor-pointer"
            >
              <span>Limit time tracker</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Automatically turns off the tracker when the limit is reached
              </span>
            </Label>
            <Switch
              id="timeTrackerLimited"
              name="timeTrackerLimited"
              defaultChecked={settings?.timeTrackerLimited}
              checked={enableLimit}
              onCheckedChange={(c) => setEnableLimit(c)}
            />
          </div>
          {enableLimit && (
            <div className="mt-4 flex items-center justify-between space-x-2 px-6">
              <Label
                htmlFor="maxTimeTrackerInHours"
                className="flex flex-col space-y-1 cursor-pointer"
              >
                <span>Limit clock-in times</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  The maximum time limit for a tracker before it automatically
                  stops
                </span>
              </Label>
              <div className="flex items-center gap-2 relative">
                <Input
                  type="number"
                  className="w-[100px] pr-16 text-right font-semibold"
                  id="maxTimeTrackerInHours"
                  name="maxTimeTrackerInHours"
                  defaultValue={fields.maxTimeTrackerInHours.initialValue}
                />
                <span className="absolute right-4 text-sm font-semibold">
                  hours
                </span>
              </div>
            </div>
          )}
          <Separator className="my-4" />
          <div className="flex items-center justify-between space-x-2 px-6">
            <Label
              htmlFor="allowClockinWithNewTask"
              className="flex flex-col space-y-1 cursor-pointer"
            >
              <span>Allow clock-in with new task</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Task will be created at clock-in
              </span>
            </Label>
            <Switch
              id="allowClockinWithNewTask"
              name="allowClockinWithNewTask"
              defaultChecked={settings?.allowClockinWithNewTask}
            />
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between space-x-2 px-6">
            <Label
              htmlFor="allowClockinWithUnplannedTasks"
              className="flex flex-col space-y-1 cursor-pointer"
            >
              <span>Allow clock-in with unplanned tasks</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Allow users to clock-in with unplanned tasks. The task is taken
                from the user's task list
              </span>
            </Label>
            <Switch
              id="allowClockinWithUnplannedTasks"
              name="allowClockinWithUnplannedTasks"
              defaultChecked={settings?.allowClockinWithUnplannedTasks}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            className="mt-4"
            variant="outline"
            disabled={submitting}
          >
            {submitting ? "Saving changes" : "Save changes"}
          </Button>
        </div>
      </Form>
    </MainContainer>
  );
}

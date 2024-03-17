import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Modal, Dialog, Button, Heading } from "react-aria-components";

import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { authenticator } from "~/services/auth.server";
import { getWeekNumber } from "~/utils/datetime";
import { getOrganizationUser } from "~/services/user.server";
import {
  organizationUserToLoggedInUser,
  requireOrganizationUser,
} from "~/utils/auth.server";
import {
  clockin,
  getTotalInCompleteTrackers,
} from "~/services/time-tracker.server";
import { getUnfinishedTasks } from "~/services/task.server";
import { getOrganizationSettings } from "~/services/organization.server";
import { emitter } from "~/utils/sse/emitter.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);

  if (!loggedInUser) {
    return redirect("/app");
  }

  const week = getWeekNumber(new Date());
  const year = new Date().getFullYear();

  try {
    await clockin({
      organizationId,
      userId: loggedInUser.id,
      week,
      year,
    });

    emitter.emit(`tracker-${loggedInUser.id}-changed`);
    emitter.emit(`${organizationId}-employee-work-status-change`);

    return redirectWithToast(`/app/${organizationId}/time-tracker`, {
      description: `You are clocked in`,
      type: "success",
    });
  } catch (error: any) {
    return redirectWithToast(`/app/${organizationId}/time-tracker/clockin`, {
      description: error.message || "Something went wrong",
      type: "error",
    });
  }
}

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

  const totalInCompleteTrackers = await getTotalInCompleteTrackers({
    userId,
    organizationId,
  });

  if (totalInCompleteTrackers) {
    return redirect(`/app/${organizationId}/time-tracker`);
  }

  const tasks = await getUnfinishedTasks({
    assigneeId: userId,
    organizationId,
  });

  const settings = await getOrganizationSettings(organizationId);

  return json({ tasks, settings });
}

export default function TimeTrackerClockin() {
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/time-tracker`)}
      className="overflow-hidden w-full max-w-lg"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Heading slot="title" className="text-lg font-semibold mb-4">
          Clock in
        </Heading>
        <p className="mb-6">Are you sure to clock in?</p>
        <Form method="POST" className="flex justify-end gap-2">
          <Button
            className={cn(buttonVariants({ variant: "ghost" }))}
            onPress={() => navigate(`/app/${orgId}/time-tracker`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className={cn(buttonVariants())}
            isDisabled={submitting}
          >
            {submitting ? "Clocking in" : "Clock in"}
          </Button>
        </Form>
      </Dialog>
    </Modal>
  );
}

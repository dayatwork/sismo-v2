import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Modal, Dialog, Button, Heading } from "react-aria-components";

import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { authenticator } from "~/services/auth.server";
import { getOrganizationUser } from "~/services/user.server";
import {
  organizationUserToLoggedInUser,
  requireOrganizationUser,
} from "~/utils/auth.server";
import {
  clockout,
  getUserTimeTrackerById,
} from "~/services/time-tracker.server";
import { emitter } from "~/utils/sse/emitter.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const trackerId = params.id;
  if (!trackerId) {
    return redirect(`/app/${organizationId}/time-tracker`);
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);

  if (!loggedInUser) {
    return redirect("/app");
  }

  await clockout({
    trackerId,
    organizationId,
    userId: loggedInUser.id,
  });

  emitter.emit(`tracker-${loggedInUser.id}-changed`);
  emitter.emit(`${organizationId}-employee-work-status-change`);

  return redirect(`/app/${organizationId}/time-tracker`);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const trackerId = params.id;
  if (!trackerId) {
    return redirect(`/app/${organizationId}/time-tracker`);
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
    return await authenticator.logout(request, { redirectTo: "/app" });
  }

  const tracker = await getUserTimeTrackerById({
    trackerId,
    userId: loggedInUser.id,
  });

  if (!tracker || tracker.endAt) {
    return redirect(`/app/${organizationId}/time-tracker`);
  }

  return json({ tracker });
}

export default function StopTimeTracker() {
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
          Clock out
        </Heading>
        <p className="mb-6">Are you sure to clock out?</p>
        <Form method="POST" className="flex justify-end gap-2">
          <Button className={cn(buttonVariants({ variant: "ghost" }))}>
            Cancel
          </Button>
          <Button
            type="submit"
            className={cn(buttonVariants())}
            isDisabled={submitting}
          >
            {submitting ? "Clocking out" : "Clock out"}
          </Button>
        </Form>
      </Dialog>
    </Modal>
  );
}

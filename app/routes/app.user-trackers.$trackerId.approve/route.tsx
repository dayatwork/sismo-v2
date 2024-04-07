import { type ActionFunctionArgs, redirect, json } from "@remix-run/node";
import { approveTracker } from "~/services/task-tracker.server";
import { requirePermission } from "~/utils/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  await requirePermission(request, "manage:employee");
  const trackerId = params.trackerId;
  if (!trackerId) {
    throw new Error("Tracker ID required");
  }

  try {
    await approveTracker({ trackerId });

    return json({ success: true, datetime: new Date() });
  } catch (error) {
    return json({ success: false, datetime: new Date() });
  }
}

export async function loader() {
  return redirect("/app/user-trackers");
}

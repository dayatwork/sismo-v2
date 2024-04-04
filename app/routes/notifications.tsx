import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";

import { requireUser } from "~/utils/auth.server";
import {
  getUserNotifications,
  readNotification,
  readUserNotifications,
} from "~/services/notification.server";

export async function action({ request }: ActionFunctionArgs) {
  const loggedInUser = await requireUser(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const notificationId = formData.get("notificationId");

  if (action === "read-all") {
    await readUserNotifications({ userId: loggedInUser.id });
    return json({ success: true });
  } else if (action === "read" && typeof notificationId === "string") {
    await readNotification({ notificationId });
    return json({ success: true });
  } else {
    return json({ success: true });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);

  const notifications = await getUserNotifications({ userId: loggedInUser.id });
  return json({ notifications });
}

export type NotificationLoader = typeof loader;
export type NotificationAction = typeof action;

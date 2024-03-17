import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";

import { authenticator } from "~/services/auth.server";
import {
  getUserNotifications,
  readNotification,
  readUserNotifications,
} from "~/services/notification.server";

export async function action({ request }: ActionFunctionArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const formData = await request.formData();
  const action = formData.get("action");
  const notificationId = formData.get("notificationId");

  if (action === "read-all") {
    await readUserNotifications({ userId: id });
    return json({ success: true });
  } else if (action === "read" && typeof notificationId === "string") {
    await readNotification({ notificationId });
    return json({ success: true });
  } else {
    return json({ success: true });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const notifications = await getUserNotifications({ userId: id });
  return json({ notifications });
}

export type NotificationLoader = typeof loader;
export type NotificationAction = typeof action;

import { json, type LoaderFunctionArgs } from "@remix-run/node";

import { authenticator } from "~/services/auth.server";
import { pusherServer } from "~/utils/pusher/pusher.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  const socketId = formData.get("socket_id") as string;
  const channel = formData.get("channel_name") as string;
  const data = {
    user_id: id,
  };

  const authResponse = pusherServer.authorizeChannel(socketId, channel, data);

  return json(authResponse);
}

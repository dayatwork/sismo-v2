import { redirect, type ActionFunctionArgs, json } from "@remix-run/node";
import { requireUser } from "~/utils/auth.server";
import { pusherServer } from "~/utils/pusher/pusher.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const conversationId = params.id;
  if (!conversationId) {
    return redirect(`/app/chat`);
  }

  const loggedInUser = await requireUser(request);

  pusherServer.trigger(conversationId, "typing", {
    user: { id: loggedInUser.id, name: loggedInUser.name },
  });

  return json({ ok: true });
}

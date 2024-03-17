import { redirect, type ActionFunctionArgs, json } from "@remix-run/node";
import { requireOrganizationUser } from "~/utils/auth.server";
import { pusherServer } from "~/utils/pusher/pusher.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const conversationId = params.id;
  if (!conversationId) {
    return redirect(`/app/${organizationId}/chat`);
  }
  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }

  pusherServer.trigger(conversationId, "typing", {
    user: { id: loggedInUser.id, name: loggedInUser.name },
  });

  return json({ ok: true });
}

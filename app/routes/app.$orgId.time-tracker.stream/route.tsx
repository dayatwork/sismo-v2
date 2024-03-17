import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { requireOrganizationUser } from "~/utils/auth.server";
import { createEventStream } from "~/utils/sse/create-event-stream.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }
  return createEventStream(request, `tracker-${loggedInUser.id}-changed`);
}

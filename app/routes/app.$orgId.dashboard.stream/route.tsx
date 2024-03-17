import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { createEventStream } from "~/utils/sse/create-event-stream.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  return createEventStream(
    request,
    `${organizationId}-employee-work-status-change`
  );
}

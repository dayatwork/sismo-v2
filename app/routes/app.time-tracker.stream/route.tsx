import { type LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/utils/auth.server";
import { createEventStream } from "~/utils/sse/create-event-stream.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);
  return createEventStream(request, `tracker-${loggedInUser.id}-changed`);
}

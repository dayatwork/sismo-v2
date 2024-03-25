import { type LoaderFunctionArgs } from "@remix-run/node";
import { createEventStream } from "~/utils/sse/create-event-stream.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return createEventStream(request, `employee-work-status-change`);
}

import { type LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { requireUser } from "~/utils/auth.server";
// import { createEventStream } from "~/utils/sse/create-event-stream.server";
import { emitter } from "~/utils/sse/emitter.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);
  // return createEventStream(request, `notifications-${id}-new`);
  return eventStream(request.signal, (send) => {
    const handle = () => {
      send({
        event: "notifications",
        data: String(Date.now()),
      });
    };

    emitter.addListener(`notifications-${loggedInUser.id}-new`, handle);

    return () => {
      emitter.removeListener(`notifications-${loggedInUser.id}-new`, handle);
    };
  });
}

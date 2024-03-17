import { type LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { authenticator } from "~/services/auth.server";
// import { createEventStream } from "~/utils/sse/create-event-stream.server";
import { emitter } from "~/utils/sse/emitter.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  // return createEventStream(request, `notifications-${id}-new`);
  return eventStream(request.signal, (send) => {
    const handle = () => {
      send({
        event: "notifications",
        data: String(Date.now()),
      });
    };

    emitter.addListener(`notifications-${id}-new`, handle);

    return () => {
      emitter.removeListener(`notifications-${id}-new`, handle);
    };
  });
}

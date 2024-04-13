import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { StreamClient } from "@stream-io/node-sdk";
import { Outlet, useLoaderData } from "@remix-run/react";

import { requireUser } from "~/utils/auth.server";
import { StreamVideoProvider } from "./stream-video-provider";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);
  const apiKey = process.env.GETSTREAM_API_KEY;
  const apiSecret = process.env.GETSTREAM_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("GetStream App Key or App Secret must be provided!");
  }

  const client = new StreamClient(apiKey, apiSecret);
  const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;
  const issued = Math.floor(Date.now() / 1000) - 60;

  const token = client.createToken(loggedInUser.id, exp, issued);

  return json({ apiKey, token });
}

export default function StreamMeeting() {
  const { apiKey, token } = useLoaderData<typeof loader>();

  return (
    <div>
      <StreamVideoProvider apiKey={apiKey} token={token}>
        <Outlet />
      </StreamVideoProvider>
    </div>
  );
}

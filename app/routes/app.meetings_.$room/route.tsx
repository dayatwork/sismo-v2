import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";

import { requireUser } from "~/utils/auth.server";
import Meeting from "./meeting";
import { getOpenedMeetingByRoomName } from "~/services/meeting.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);

  const domain = process.env.JITSI_SERVER_DOMAIN;
  const roomName = params.room;

  if (!domain) {
    return redirect(`/app/dashboard`);
  }

  if (!roomName) {
    return redirect(`/app/meetings`);
  }

  const meeting = await getOpenedMeetingByRoomName({ roomName });

  if (!meeting) {
    return redirect(`/app/meetings`);
  }

  return json({
    domain,
    roomName,
    userInfo: {
      displayName: loggedInUser.name,
      email: loggedInUser.email,
    },
  });
}

export default function MeetingRoom() {
  const { domain, roomName, userInfo } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100vh-64px)]">
      <Meeting
        domain={domain}
        roomName={roomName}
        onClose={() => navigate(`/app/meetings`)}
        userInfo={userInfo}
      />
    </div>
  );
}

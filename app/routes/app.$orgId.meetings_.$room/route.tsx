import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";

import { requireOrganizationUser } from "~/utils/auth.server";
import Meeting from "./meeting";
import { getOpenedMeetingByRoomName } from "~/services/meeting.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }

  const domain = process.env.JITSI_SERVER_DOMAIN;
  const roomName = params.room;

  if (!domain) {
    return redirect(`/app/${organizationId}/dashboard`);
  }

  if (!roomName) {
    return redirect(`/app/${organizationId}/meetings`);
  }

  const meeting = await getOpenedMeetingByRoomName({ roomName });

  if (!meeting) {
    return redirect(`/app/${organizationId}/meetings`);
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
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100vh-64px)]">
      <Meeting
        domain={domain}
        roomName={roomName}
        onClose={() => navigate(`/app/${orgId}/meetings`)}
        userInfo={userInfo}
      />
    </div>
  );
}

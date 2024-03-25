import { type SerializeFrom } from "@remix-run/node";
import { CrownIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { type LoggedInUserPayload } from "~/utils/auth.server";

export default function MemberBadge({
  loggedInUser,
}: {
  loggedInUser: SerializeFrom<LoggedInUserPayload>;
}) {
  if (loggedInUser.isSuperAdmin) {
    return (
      <p className="hidden xl:flex px-3 py-1 rounded text-sm tracking-wide uppercase font-bold border-2 whitespace-nowrap border-[#D4AF37] text-[#D4AF37] items-center">
        <CrownIcon className="w-4 h-4 mr-2" />
        SUPER ADMIN
      </p>
    );
  }

  return (
    <p className="hidden xl:flex">
      <span className="px-2 py-1 rounded-l text-sm tracking-wide uppercase font-semibold border whitespace-nowrap">
        {loggedInUser.memberId}
      </span>
      <span
        className={cn(
          "px-2 py-1 rounded-r text-sm tracking-wide uppercase font-semibold border",
          loggedInUser.memberStatus === "FULLTIME" &&
            "border-green-600 text-green-600",
          loggedInUser.memberStatus === "OUTSOURCED" &&
            "border-blue-600 text-blue-600",
          loggedInUser.memberStatus === "INTERN" &&
            "border-pink-600 text-pink-600"
        )}
      >
        {loggedInUser.memberStatus}
      </span>
    </p>
  );
}

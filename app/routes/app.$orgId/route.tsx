import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import AppLogo from "~/components/app-logo";

import { authenticator } from "~/services/auth.server";
import { getOrganizationUser } from "~/services/user.server";
import { organizationUserToLoggedInUser } from "~/utils/auth.server";
import { getWeekNumber } from "~/utils/datetime";
import ProfileDropdown from "~/components/profile-dropdown";
import { CurrentDateTime } from "./current-datetime";
import { ThemeSwitch } from "../action.set-theme";
import AppNavigation from "./app-navigation";
import NotificationButton from "./notification-button";
import { getUserOrganizations } from "~/services/organization.server";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import MobileNav from "./mobile-nav";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const { id: userId } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // const organizationUser = await getOrganizationUser({
  //   organizationId,
  //   userId,
  // });
  // const userOrganizations = await getUserOrganizations(userId);
  const [organizationUser, userOrganizations] = await Promise.all([
    getOrganizationUser({
      organizationId,
      userId,
    }),
    getUserOrganizations(userId),
  ]);

  const loggedInUser = organizationUserToLoggedInUser(organizationUser);

  if (!loggedInUser || !loggedInUser.organization?.isActive) {
    return redirect("/app");
  }

  return json({ loggedInUser, userOrganizations });
}

export default function AppLayout() {
  const { loggedInUser, userOrganizations } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChangeOrganization = (orgId: string) => {
    if (loggedInUser.organization?.id) {
      navigate(location.pathname.replace(loggedInUser.organization.id, orgId));
    } else navigate(`/app/${orgId}`);
  };

  return (
    <>
      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-56 2xl:w-60 lg:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-2 border-r border bg-background">
          <Link to="/app">
            <AppLogo />
          </Link>
          <div className="h-[calc(100vh-64px)] overflow-auto px-6 pb-4">
            <AppNavigation />
          </div>
        </div>
      </div>

      <div className="lg:pl-56 2xl:pl-60">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="block lg:hidden">
            <MobileNav />
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 items-center justify-between gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex gap-4 items-center">
              <Select
                defaultValue={loggedInUser.organization?.id}
                onValueChange={handleChangeOrganization}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userOrganizations.map((userOrg) => (
                    <SelectItem
                      key={userOrg.organization.id}
                      value={userOrg.organization.id}
                    >
                      {userOrg.organization.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            </div>
            <div className="flex items-center gap-x-2 lg:gap-x-4">
              <p className="text-sm xl:text-lg font-bold whitespace-nowrap">
                Week {getWeekNumber(new Date())}
              </p>
              <CurrentDateTime />
              <ThemeSwitch />
              <NotificationButton />

              {/* Separator */}
              <div
                className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
                aria-hidden="true"
              />

              {/* Profile dropdown */}
              <ProfileDropdown
                name={loggedInUser.name}
                photo={loggedInUser.photo}
              />
            </div>
          </div>
        </div>
        <Outlet />
      </div>
    </>
  );
}

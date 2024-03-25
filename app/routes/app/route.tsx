import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import AppLogo from "~/components/app-logo";

import { requireUser } from "~/utils/auth.server";
import { getWeekNumber } from "~/utils/datetime";
import ProfileDropdown from "~/components/profile-dropdown";
import { CurrentDateTime } from "./current-datetime";
import { ThemeSwitch } from "../action.set-theme";
import AppNavigation from "./app-navigation";
import NotificationButton from "./notification-button";
import MobileNav from "./mobile-nav";
import MemberBadge from "./member-badge";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);

  return json({ loggedInUser });
}

export default function AppLayout() {
  const { loggedInUser } = useLoaderData<typeof loader>();

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
              <MemberBadge loggedInUser={loggedInUser} />
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

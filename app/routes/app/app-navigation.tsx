import { Link, useLocation } from "@remix-run/react";
import {
  type LucideIcon,
  LayoutDashboardIcon,
  TimerIcon,
  CalendarClockIcon,
  UsersIcon,
  ClipboardListIcon,
  NetworkIcon,
  KeyRoundIcon,
  SettingsIcon,
  BarChart3,
  MessageCircle,
  Files,
  PencilRuler,
  Video,
  Landmark,
  Banknote,
} from "lucide-react";

import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { ProtectComponent, useUserPermissions } from "~/utils/auth";
import { type PermissionName } from "~/utils/permission";

type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  current: boolean;
  permissions?: PermissionName[];
};

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/app/dashboard",
    icon: LayoutDashboardIcon,
    current: true,
  },
  {
    name: "Time Tracker",
    href: "/app/time-tracker",
    icon: TimerIcon,
    current: false,
  },
  {
    name: "Tracker History",
    href: "/app/tracker-history",
    icon: CalendarClockIcon,
    current: false,
  },
];

const toolNavigation: NavigationItem[] = [
  {
    name: "Documents",
    href: "/app/documents",
    icon: Files,
    current: false,
  },
  {
    name: "Drawings",
    href: "/app/drawings",
    icon: PencilRuler,
    current: false,
  },
  {
    name: "Chat",
    href: "/app/chat",
    icon: MessageCircle,
    current: false,
  },
  {
    name: "Meetings",
    href: "/app/meetings",
    icon: Video,
    current: false,
  },
];

const workManagementNavigation: NavigationItem[] = [
  {
    name: "Workspaces",
    href: "/app/workspaces",
    icon: MessageCircle,
    current: false,
  },
  {
    name: "User Trackers",
    href: "/app/user-trackers",
    icon: ClipboardListIcon,
    current: false,
    permissions: ["manage:employee"],
  },
  {
    name: "Reports",
    href: "/app/reports",
    icon: BarChart3,
    current: false,
    permissions: ["manage:employee"],
  },
];

const userManagementNavigation: NavigationItem[] = [
  {
    name: "IAM",
    href: "/app/iam",
    icon: KeyRoundIcon,
    current: false,
    permissions: ["manage:iam"],
  },
  {
    name: "Departments",
    href: "/app/departments",
    icon: NetworkIcon,
    current: false,
    permissions: ["manage:department"],
  },
  {
    name: "Teams",
    href: "/app/teams",
    icon: UsersIcon,
    current: false,
    permissions: ["manage:team"],
  },
];

const financeNavigation: NavigationItem[] = [
  {
    name: "Chart of Account",
    href: "chart-of-accounts",
    icon: Landmark,
    current: false,
    permissions: ["manage:finance"],
  },
  {
    name: "Journal",
    href: "journals",
    icon: Banknote,
    current: false,
    permissions: ["manage:finance"],
  },
];

const othersNavigation: NavigationItem[] = [
  {
    name: "Settings",
    href: "/app/settings",
    icon: SettingsIcon,
    current: false,
    permissions: ["manage:organization"],
  },
];

const hasAccessToNavigation = ({
  isSuperAdmin,
  navigationItems,
  userPermissions,
}: {
  navigationItems: NavigationItem[];
  userPermissions: string[];
  isSuperAdmin?: boolean;
}) => {
  if (isSuperAdmin) {
    return true;
  }

  for (let i = 0; i < navigationItems.length; i++) {
    const permissions = navigationItems[i].permissions;
    if (!permissions) {
      return true;
    }

    for (let j = 0; j < permissions.length; j++) {
      if (userPermissions.includes(permissions[j])) {
        return true;
      }
    }
  }

  return false;
};

export default function AppNavigation() {
  const { isSuperAdmin, userPermissions } = useUserPermissions();

  return (
    <nav className="flex-1 flex flex-col pb-10">
      <ul className="flex flex-1 flex-col">
        <li>
          <ul className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLinkItem item={item} />
              </li>
            ))}
          </ul>
        </li>
        <Separator className="my-4" />
        <li>
          <NavGroupHeader label="Tools" />
          <ul className="-mx-2 space-y-1">
            {toolNavigation.map((item) => (
              <li key={item.name}>
                <NavLinkItem item={item} />
              </li>
            ))}
          </ul>
        </li>

        {hasAccessToNavigation({
          isSuperAdmin,
          userPermissions,
          navigationItems: workManagementNavigation,
        }) && (
          <>
            <Separator className="my-4" />
            <li>
              <NavGroupHeader label="Work & Report" />
              <ul className="-mx-2 space-y-1">
                {workManagementNavigation.map((item) => (
                  <ProtectComponent
                    key={item.name}
                    permission={item.permissions}
                  >
                    <li key={item.name}>
                      <NavLinkItem item={item} />
                    </li>
                  </ProtectComponent>
                ))}
              </ul>
            </li>
          </>
        )}

        {hasAccessToNavigation({
          isSuperAdmin,
          userPermissions,
          navigationItems: userManagementNavigation,
        }) && (
          <>
            <Separator className="my-4" />
            <li>
              <NavGroupHeader label="User & Group" />
              <ul className="-mx-2 space-y-1">
                {userManagementNavigation.map((item) => (
                  <ProtectComponent
                    key={item.name}
                    permission={item.permissions}
                  >
                    <li key={item.name}>
                      <NavLinkItem item={item} />
                    </li>
                  </ProtectComponent>
                ))}
              </ul>
            </li>
          </>
        )}

        {hasAccessToNavigation({
          isSuperAdmin,
          userPermissions,
          navigationItems: financeNavigation,
        }) && (
          <>
            <Separator className="my-4" />
            <li>
              <NavGroupHeader label="Finance" />
              <ul className="-mx-2 space-y-1">
                {financeNavigation.map((item) => (
                  <ProtectComponent
                    key={item.name}
                    permission={item.permissions}
                  >
                    <li key={item.name}>
                      <NavLinkItem item={item} />
                    </li>
                  </ProtectComponent>
                ))}
              </ul>
            </li>
          </>
        )}

        {hasAccessToNavigation({
          isSuperAdmin,
          userPermissions,
          navigationItems: othersNavigation,
        }) && (
          <>
            <Separator className="my-4" />
            <li>
              <NavGroupHeader label="Others" />
              <ul className="-mx-2 space-y-1">
                {othersNavigation.map((item) => (
                  <ProtectComponent
                    key={item.name}
                    permission={item.permissions}
                  >
                    <li key={item.name}>
                      <NavLinkItem item={item} />
                    </li>
                  </ProtectComponent>
                ))}
              </ul>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

function NavLinkItem({ item }: { item: NavigationItem }) {
  const { pathname } = useLocation();
  return (
    <Link
      to={item.href}
      className={cn(
        "inline-flex items-center w-full px-2 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5",
        pathname.startsWith(item.href)
          ? "bg-primary/20 hover:bg-primary/10"
          : "hover:bg-muted"
      )}
    >
      <item.icon
        className={cn(
          "w- h-5 mr-3",
          pathname.startsWith(item.href)
            ? "bg-transparent"
            : "hover:bg-transparent hover:underline"
        )}
        aria-hidden="true"
      />
      {item.name}
    </Link>
  );
}

function NavGroupHeader({ label }: { label: string }) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground mb-3">
      {label}
    </h3>
  );
}

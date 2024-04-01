import { Link, useLocation } from "@remix-run/react";
import {
  LayoutDashboardIcon,
  TimerIcon,
  type LucideIcon,
  CalendarClockIcon,
  // FolderKanbanIcon,
  // LayoutGridIcon,
  // BoxesIcon,
  // UserSquare2Icon,
  // UserCog2Icon,
  UsersIcon,
  ClipboardListIcon,
  // CalendarDaysIcon,
  NetworkIcon,
  KeyRoundIcon,
  SettingsIcon,
  BarChart3,
  // Files,
  // PencilRuler,
  // MessageCircle,
  // Video,
  // Banknote,
  // Landmark,
  // Mail,
  MessageCircle,
  Files,
  PencilRuler,
  UserSquare2Icon,
  // SquareUserRound,
} from "lucide-react";

import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { ProtectComponent, useUserPermissions } from "~/utils/auth";
// import { ProtectComponent } from "~/utils/auth";

// import { getWeekNumber } from "~/utils/datetime";
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
  // {
  //   name: "Your Work Plan",
  //   href: `weekly-work-plan/${new Date().getFullYear()}/${getWeekNumber(
  //     new Date()
  //   )}`,
  //   icon: CalendarDaysIcon,
  //   current: false,
  // },
  // {
  //   name: "Your Tasks",
  //   href: "/app/your-tasks",
  //   icon: CircleDotIcon,
  //   current: false,
  // },
  // {
  //   name: "Achivements",
  //   href: "achivements",
  //   icon: FileBadge2Icon,
  //   current: false,
  // },
];

const toolNavigation: NavigationItem[] = [
  {
    name: "Documents",
    href: "documents",
    icon: Files,
    current: false,
  },
  {
    name: "Drawings",
    href: "drawings",
    icon: PencilRuler,
    current: false,
  },
];

// const communicationNavigation: NavigationItem[] = [
//   {
//     name: "Chat",
//     href: "chat",
//     icon: MessageCircle,
//     current: false,
//   },
//   {
//     name: "Mail",
//     href: "mail",
//     icon: Mail,
//     current: false,
//   },
//   {
//     name: "Meetings",
//     href: "meetings",
//     icon: Video,
//     current: false,
//   },
// ];

const projectNavigation: NavigationItem[] = [
  // {
  //   name: "Projects",
  //   href: "projects",
  //   icon: FolderKanbanIcon,
  //   current: false,
  //   permissions: ["manage:project"],
  // },
  {
    name: "Clients",
    href: "clients",
    icon: UserSquare2Icon,
    current: false,
    permissions: ["manage:client"],
  },
  // {
  //   name: "Services",
  //   href: "services",
  //   icon: LayoutGridIcon,
  //   current: false,
  //   permissions: ["manage:service"],
  // },
  // {
  //   name: "Products",
  //   href: "products",
  //   icon: BoxesIcon,
  //   current: false,
  //   permissions: ["manage:product"],
  // },

  // {
  //   name: "Client Types",
  //   href: "client-types",
  //   icon: UserCog2Icon,
  //   current: false,
  //   permissions: ["manage:client"],
  // },
];

const employeeNavigation: NavigationItem[] = [
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
  // {
  //   name: "Work Plan",
  //   href: `employee-work-plan/${new Date().getFullYear()}/${getWeekNumber(
  //     new Date()
  //   )}`,
  //   icon: CalendarDaysIcon,
  //   current: false,
  // },
];

// const financeNavigation: NavigationItem[] = [
//   {
//     name: "Chart of Account",
//     href: "chart-of-accounts",
//     icon: Landmark,
//     current: false,
//     permissions: ["manage:finance"],
//   },
//   // {
//   //   name: "Expenses",
//   //   href: "expenses",
//   //   icon: Banknote,
//   //   current: false,
//   //   permissions: ["manage:finance"],
//   // },
//   {
//     name: "Journal",
//     href: "journals",
//     icon: Banknote,
//     current: false,
//     permissions: ["manage:finance"],
//   },
// ];

const othersNavigation: NavigationItem[] = [
  // {
  //   name: "Organization",
  //   href: "organization",
  //   icon: NetworkIcon,
  //   current: false,
  //   permissions: ["manage:organization"],
  // },

  {
    name: "Settings",
    href: "/app/settings",
    icon: SettingsIcon,
    current: false,
    permissions: ["manage:organization"],
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
  const { pathname } = useLocation();
  const { isSuperAdmin, userPermissions } = useUserPermissions();

  return (
    <nav className="flex-1 flex flex-col pb-10">
      <ul className="flex flex-1 flex-col">
        <li>
          <ul className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
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
              </li>
            ))}
          </ul>
        </li>
        <Separator className="my-4" />
        <li>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Tools
          </h3>
          <ul className="-mx-2 space-y-1">
            {toolNavigation.map((item) => (
              <li key={item.name}>
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
              </li>
            ))}
          </ul>
        </li>
        {/* <Separator className="my-4" />
        <li>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Communications
          </h3>
          <ul className="-mx-2 space-y-1">
            {communicationNavigation.map((item) => (
              <li key={item.name}>
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
              </li>
            ))}
          </ul>
        </li> */}

        {hasAccessToNavigation({
          isSuperAdmin,
          userPermissions,
          navigationItems: workManagementNavigation,
        }) && (
          <>
            <Separator className="my-4" />
            <li>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Work & Report
              </h3>
              <ul className="-mx-2 space-y-1">
                {workManagementNavigation.map((item) => (
                  <ProtectComponent
                    key={item.name}
                    permission={item.permissions}
                  >
                    <li key={item.name}>
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
          navigationItems: employeeNavigation,
        }) && (
          <>
            <Separator className="my-4" />
            <li>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                User & Group
              </h3>
              <ul className="-mx-2 space-y-1">
                {employeeNavigation.map((item) => (
                  <ProtectComponent
                    key={item.name}
                    permission={item.permissions}
                  >
                    <li key={item.name}>
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
          navigationItems: projectNavigation,
        }) && (
          <>
            <Separator className="my-4" />
            <li>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Project
              </h3>
              <ul className="-mx-2 space-y-1">
                {projectNavigation.map((item) => (
                  <ProtectComponent
                    key={item.name}
                    permission={item.permissions}
                  >
                    <li key={item.name}>
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
                    </li>
                  </ProtectComponent>
                ))}
              </ul>
            </li>
          </>
        )}

        {/* {hasAccessToNavigation({
          isSuperAdmin,
          userPermissions,
          navigationItems: financeNavigation,
        }) && (
          <>
            <Separator className="my-4" />
            <li>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Finance
              </h3>
              <ul className="-mx-2 space-y-1">
                {financeNavigation.map((item) => (
                  <ProtectComponent
                    key={item.name}
                    permission={item.permissions}
                  >
                    <li key={item.name}>
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
                    </li>
                  </ProtectComponent>
                ))}
              </ul>
            </li>
          </>
        )} */}

        {hasAccessToNavigation({
          isSuperAdmin,
          userPermissions,
          navigationItems: othersNavigation,
        }) && (
          <>
            <Separator className="my-4" />
            <li>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Others
              </h3>
              <ul className="-mx-2 space-y-1">
                {othersNavigation.map((item) => (
                  <ProtectComponent
                    key={item.name}
                    permission={item.permissions}
                  >
                    <li key={item.name}>
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

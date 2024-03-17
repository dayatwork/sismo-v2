import { Link, useLocation, useParams } from "@remix-run/react";
import {
  LayoutDashboardIcon,
  TimerIcon,
  type LucideIcon,
  CalendarClockIcon,
  FolderKanbanIcon,
  LayoutGridIcon,
  BoxesIcon,
  UserSquare2Icon,
  // UserCog2Icon,
  UsersIcon,
  ClipboardListIcon,
  // CalendarDaysIcon,
  NetworkIcon,
  KeyRoundIcon,
  SettingsIcon,
  CircleDotIcon,
  BarChart3,
  Files,
  PencilRuler,
  // MessageCircle,
  Video,
  Banknote,
  Landmark,
  Mail,
  MessageCircle,
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
    href: "dashboard",
    icon: LayoutDashboardIcon,
    current: true,
  },
  {
    name: "Time Tracker",
    href: "time-tracker",
    icon: TimerIcon,
    current: false,
  },
  {
    name: "Tracker History",
    href: "tracker-history",
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
  {
    name: "Your Tasks",
    href: "your-tasks?status=backlog&status=todo&status=in_progress",
    icon: CircleDotIcon,
    current: false,
  },
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
const communicationNavigation: NavigationItem[] = [
  {
    name: "Chat",
    href: "chat",
    icon: MessageCircle,
    current: false,
  },
  {
    name: "Mail",
    href: "mail",
    icon: Mail,
    current: false,
  },
  {
    name: "Meetings",
    href: "meetings",
    icon: Video,
    current: false,
  },
];

const projectNavigation: NavigationItem[] = [
  {
    name: "Projects",
    href: "projects",
    icon: FolderKanbanIcon,
    current: false,
    permissions: ["manage:project"],
  },
  {
    name: "Clients",
    href: "clients",
    icon: UserSquare2Icon,
    current: false,
    permissions: ["manage:client"],
  },
  {
    name: "Services",
    href: "services",
    icon: LayoutGridIcon,
    current: false,
    permissions: ["manage:service"],
  },
  {
    name: "Products",
    href: "products",
    icon: BoxesIcon,
    current: false,
    permissions: ["manage:product"],
  },

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
    name: "Employees",
    href: "employees",
    icon: UsersIcon,
    current: false,
    permissions: ["manage:employee"],
  },
  // {
  //   name: "Work Plan",
  //   href: `employee-work-plan/${new Date().getFullYear()}/${getWeekNumber(
  //     new Date()
  //   )}`,
  //   icon: CalendarDaysIcon,
  //   current: false,
  // },
  {
    name: "Employee Work",
    href: "employee-work",
    icon: ClipboardListIcon,
    current: false,
    permissions: ["manage:employee"],
  },
  {
    name: "Reports",
    href: "reports",
    icon: BarChart3,
    current: false,
    permissions: ["manage:employee"],
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
  // {
  //   name: "Expenses",
  //   href: "expenses",
  //   icon: Banknote,
  //   current: false,
  //   permissions: ["manage:finance"],
  // },
  {
    name: "Journal",
    href: "journals",
    icon: Banknote,
    current: false,
    permissions: ["manage:finance"],
  },
];

const organizationNavigation: NavigationItem[] = [
  {
    name: "Organization",
    href: "organization",
    icon: NetworkIcon,
    current: false,
    permissions: ["manage:organization"],
  },
  {
    name: "IAM",
    href: "iam",
    icon: KeyRoundIcon,
    current: false,
    permissions: ["manage:iam"],
  },
  {
    name: "Settings",
    href: "settings",
    icon: SettingsIcon,
    current: false,
    permissions: ["manage:organization"],
  },
];

const hasAccessToNavigation = ({
  isAdmin,
  navigationItems,
  userPermissions,
}: {
  navigationItems: NavigationItem[];
  userPermissions: string[];
  isAdmin?: boolean;
}) => {
  if (isAdmin) {
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
  const { orgId } = useParams<{ orgId: string }>();
  const { isAdmin, userPermissions } = useUserPermissions();

  return (
    <nav className="flex-1 flex flex-col pb-10">
      <ul className="flex flex-1 flex-col">
        <li>
          <ul className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={`/app/${orgId}/${item.href}`}
                  className={cn(
                    "inline-flex items-center w-full px-2 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5",
                    pathname === item.href
                      ? "bg-primary/20 hover:bg-primary/10"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w- h-5 mr-3",
                      pathname === item.href
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
            {/* Tools & Communications */}
          </h3>
          <ul className="-mx-2 space-y-1">
            {toolNavigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={`/app/${orgId}/${item.href}`}
                  className={cn(
                    "inline-flex items-center w-full px-2 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5",
                    pathname === item.href
                      ? "bg-primary/20 hover:bg-primary/10"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w- h-5 mr-3",
                      pathname === item.href
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
            Communications
            {/* Tools & Communications */}
          </h3>
          <ul className="-mx-2 space-y-1">
            {communicationNavigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={`/app/${orgId}/${item.href}`}
                  className={cn(
                    "inline-flex items-center w-full px-2 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5",
                    pathname === item.href
                      ? "bg-primary/20 hover:bg-primary/10"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w- h-5 mr-3",
                      pathname === item.href
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
        {hasAccessToNavigation({
          isAdmin,
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
                        to={`/app/${orgId}/${item.href}`}
                        className={cn(
                          "inline-flex items-center w-full px-2 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5",
                          pathname === item.href
                            ? "bg-primary/20 hover:bg-primary/10"
                            : "hover:bg-muted"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w- h-5 mr-3",
                            pathname === item.href
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
          isAdmin,
          userPermissions,
          navigationItems: employeeNavigation,
        }) && (
          <>
            <Separator className="my-4" />
            <li>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Employee
              </h3>
              <ul className="-mx-2 space-y-1">
                {employeeNavigation.map((item) => (
                  <ProtectComponent
                    key={item.name}
                    permission={item.permissions}
                  >
                    <li key={item.name}>
                      <Link
                        to={`/app/${orgId}/${item.href}`}
                        className={cn(
                          "inline-flex items-center w-full px-2 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5",
                          pathname === item.href
                            ? "bg-primary/20 hover:bg-primary/10"
                            : "hover:bg-muted"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w- h-5 mr-3",
                            pathname === item.href
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
          isAdmin,
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
                        to={`/app/${orgId}/${item.href}`}
                        className={cn(
                          "inline-flex items-center w-full px-2 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5",
                          pathname === item.href
                            ? "bg-primary/20 hover:bg-primary/10"
                            : "hover:bg-muted"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w- h-5 mr-3",
                            pathname === item.href
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
          isAdmin,
          userPermissions,
          navigationItems: organizationNavigation,
        }) && (
          <>
            <Separator className="my-4" />
            <li>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Organization
              </h3>
              <ul className="-mx-2 space-y-1">
                {organizationNavigation.map((item) => (
                  <ProtectComponent
                    key={item.name}
                    permission={item.permissions}
                  >
                    <li key={item.name}>
                      <Link
                        to={`/app/${orgId}/${item.href}`}
                        className={cn(
                          "inline-flex items-center w-full px-2 rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5",
                          pathname === item.href
                            ? "bg-primary/20 hover:bg-primary/10"
                            : "hover:bg-muted"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w- h-5 mr-3",
                            pathname === item.href
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

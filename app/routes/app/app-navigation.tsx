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
  HandCoins,
  Scissors,
  Coins,
  FileCog,
  PieChart,
  ArrowRightLeft,
  Scale,
  FileLineChart,
  ChevronsRight,
  ChevronsLeft,
  MonitorStop,
  CornerDownRight,
  FolderKanban,
  MoreHorizontal,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
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
  // {
  //   name: "Meetings",
  //   href: "/app/meetings",
  //   icon: Video,
  //   current: false,
  // },
];

const meetingsNavigation: NavigationItem[] = [
  {
    name: "Home",
    href: "/app/stream-meetings/home",
    icon: MonitorStop,
    current: false,
  },
  {
    name: "Upcoming",
    href: "/app/stream-meetings/upcoming",
    icon: ChevronsRight,
    current: false,
  },
  {
    name: "Previous",
    href: "/app/stream-meetings/previous",
    icon: ChevronsLeft,
    current: false,
  },
  {
    name: "Recordings",
    href: "/app/stream-meetings/recordings",
    icon: Video,
    current: false,
  },
];

const taskManagementNavigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/app/task-dashboard",
    icon: PieChart,
    current: false,
  },
  {
    name: "Workspaces",
    href: "/app/workspaces",
    icon: MessageCircle,
    current: false,
  },
];

const userManagementNavigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/app/user-dashboard",
    icon: PieChart,
    current: false,
  },
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

const payrollManagementNavigation: NavigationItem[] = [
  {
    name: "Payroll",
    href: "/app/payroll",
    icon: HandCoins,
    current: false,
    permissions: ["manage:payroll"],
  },
  {
    name: "Wages",
    href: "/app/wages",
    icon: Coins,
    current: false,
    permissions: ["manage:payroll"],
  },
  {
    name: "Deductions",
    href: "/app/deductions",
    icon: Scissors,
    current: false,
    permissions: ["manage:payroll"],
  },
];

const financeNavigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/app/finance-dashboard",
    icon: PieChart,
    current: false,
    permissions: ["manage:finance"],
  },
  {
    name: "Chart of Account",
    href: "/app/chart-of-accounts",
    icon: Landmark,
    current: false,
    permissions: ["manage:finance"],
  },
  {
    name: "Journal Entry",
    href: "/app/journals",
    icon: Banknote,
    current: false,
    permissions: ["manage:finance"],
  },
  {
    name: "Ledger Accounts",
    href: "/app/account-transactions",
    icon: ArrowRightLeft,
    current: false,
    permissions: ["manage:finance"],
  },
  {
    name: "Trial Balance",
    href: "/app/trial-balance",
    icon: Scale,
    current: false,
    permissions: ["manage:finance"],
  },
  {
    name: "Financial Statements",
    href: "/app/financial-statements",
    icon: FileLineChart,
    current: false,
    permissions: ["manage:finance"],
  },
  {
    name: "Settings",
    href: "/app/finance-settings",
    icon: FileCog,
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
      <div className="flex flex-1 flex-col gap-1">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLinkItem item={item} />
            </li>
          ))}
        </ul>
        <Separator className="my-2" />

        <Accordion type="multiple" className="space-y-2">
          <AccordionItem value="tools" className="border-b-0">
            <AccordionTrigger className="inline-flex items-center w-full pl-4 pr-2 font-medium text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5 hover:bg-accent hover:no-underline">
              <div className="flex items-center">
                <PencilRuler className="w-5 h-5 mr-3" />
                Tools
              </div>
            </AccordionTrigger>
            <AccordionContent className="border-b-0">
              <ul className="space-y-1">
                {toolNavigation.map((item) => (
                  <li key={item.name}>
                    <NavLinkItem item={item} isSubNav />
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="meetings" className="border-b-0">
            <AccordionTrigger className="inline-flex items-center w-full pl-4 pr-2 font-medium text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5 hover:bg-accent hover:no-underline">
              <div className="flex items-center">
                <MonitorStop className="w-5 h-5 mr-3" />
                Meetings
              </div>
            </AccordionTrigger>
            <AccordionContent className="border-b-0">
              <ul className="space-y-1">
                {meetingsNavigation.map((item) => (
                  <li key={item.name}>
                    <NavLinkItem item={item} isSubNav />
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {hasAccessToNavigation({
            isSuperAdmin,
            userPermissions,
            navigationItems: taskManagementNavigation,
          }) && (
            <AccordionItem value="tasks" className="border-b-0">
              <AccordionTrigger className="inline-flex items-center w-full pl-4 pr-2 font-medium text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5 hover:bg-accent hover:no-underline">
                <div className="flex items-center">
                  <FolderKanban className="w-5 h-5 mr-3" />
                  Task Management
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-b-0">
                <ul className="space-y-1">
                  {taskManagementNavigation.map((item) => (
                    <ProtectComponent
                      key={item.name}
                      permission={item.permissions}
                    >
                      <li>
                        <NavLinkItem item={item} isSubNav />
                      </li>
                    </ProtectComponent>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasAccessToNavigation({
            isSuperAdmin,
            userPermissions,
            navigationItems: userManagementNavigation,
          }) && (
            <AccordionItem value="users" className="border-b-0">
              <AccordionTrigger className="inline-flex items-center w-full pl-4 pr-2 font-medium text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5 hover:bg-accent hover:no-underline">
                <div className="flex items-center">
                  <UsersIcon className="w-5 h-5 mr-3" />
                  User Management
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-b-0">
                <ul className="space-y-1">
                  {userManagementNavigation.map((item) => (
                    <ProtectComponent
                      key={item.name}
                      permission={item.permissions}
                    >
                      <li>
                        <NavLinkItem item={item} isSubNav />
                      </li>
                    </ProtectComponent>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasAccessToNavigation({
            isSuperAdmin,
            userPermissions,
            navigationItems: payrollManagementNavigation,
          }) && (
            <AccordionItem value="payroll" className="border-b-0">
              <AccordionTrigger className="inline-flex items-center w-full pl-4 pr-2 font-medium text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5 hover:bg-accent hover:no-underline">
                <div className="flex items-center">
                  <HandCoins className="w-5 h-5 mr-3" />
                  Payroll
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-b-0">
                <ul className="space-y-1">
                  {payrollManagementNavigation.map((item) => (
                    <ProtectComponent
                      key={item.name}
                      permission={item.permissions}
                    >
                      <li>
                        <NavLinkItem item={item} isSubNav />
                      </li>
                    </ProtectComponent>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasAccessToNavigation({
            isSuperAdmin,
            userPermissions,
            navigationItems: financeNavigation,
          }) && (
            <AccordionItem value="finance" className="border-b-0">
              <AccordionTrigger className="inline-flex items-center w-full pl-4 pr-2 font-medium text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5 hover:bg-accent hover:no-underline">
                <div className="flex items-center">
                  <Landmark className="w-5 h-5 mr-3" />
                  Finance
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-b-0">
                <ul className="space-y-1">
                  {financeNavigation.map((item) => (
                    <ProtectComponent
                      key={item.name}
                      permission={item.permissions}
                    >
                      <li>
                        <NavLinkItem item={item} isSubNav />
                      </li>
                    </ProtectComponent>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasAccessToNavigation({
            isSuperAdmin,
            userPermissions,
            navigationItems: othersNavigation,
          }) && (
            <AccordionItem value="others" className="border-b-0">
              <AccordionTrigger className="inline-flex items-center w-full pl-4 pr-2 font-medium text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5 hover:bg-accent hover:no-underline">
                <div className="flex items-center">
                  <MoreHorizontal className="w-5 h-5 mr-3" />
                  Others
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-b-0">
                <ul className="space-y-1">
                  {othersNavigation.map((item) => (
                    <ProtectComponent
                      key={item.name}
                      permission={item.permissions}
                    >
                      <li>
                        <NavLinkItem item={item} isSubNav />
                      </li>
                    </ProtectComponent>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </nav>
  );
}

function NavLinkItem({
  item,
  isSubNav,
}: {
  item: NavigationItem;
  isSubNav?: boolean;
}) {
  const { pathname } = useLocation();
  return (
    <Link
      to={item.href}
      className={cn(
        "inline-flex items-center w-full px-4 font-medium text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-1.5",
        pathname.startsWith(item.href)
          ? "bg-primary/20 hover:bg-primary/10"
          : "hover:bg-muted",
        isSubNav ? "pl-6" : ""
      )}
    >
      {isSubNav && (
        <CornerDownRight className="w-4 h-4 mr-2 text-muted-foreground/50" />
      )}

      <item.icon
        className={cn(
          "w-5 h-5 mr-3",
          pathname.startsWith(item.href)
            ? "bg-transparent"
            : "hover:bg-transparent hover:underline"
        )}
        aria-hidden="true"
      />
      <span>{item.name}</span>
    </Link>
  );
}

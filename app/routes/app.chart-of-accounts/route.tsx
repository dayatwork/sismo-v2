import { type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { FileText, type LucideIcon } from "lucide-react";

import MainContainer from "~/components/main-container";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { requirePermission } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:iam");

  return null;
}

const tabItems: { label: string; value: string; icon: LucideIcon }[] = [
  {
    label: "Account Categories",
    value: "category",
    icon: FileText,
  },
  {
    label: "Account Types",
    value: "type",
    icon: FileText,
  },
  {
    label: "Accounts",
    value: "coa",
    icon: FileText,
  },
];

export default function ChartOfAccountsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <MainContainer>
      <h1 className="sr-only">Chart of Accounts</h1>
      <Tabs
        className="mb-4"
        defaultValue={location.pathname.split("/")[3]}
        onValueChange={(v) => navigate(`/app/chart-of-accounts/${v}`)}
      >
        <TabsList className="gap-1">
          {tabItems.map((tabItem) => (
            <TabsTrigger
              key={tabItem.value}
              className="pl-6 pr-8 hover:bg-background"
              value={tabItem.value}
            >
              <tabItem.icon className="h-4 w-4 mr-2" />
              <span>{tabItem.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Outlet />
    </MainContainer>
  );
}

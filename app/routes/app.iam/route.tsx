import { type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { UserCheck2, Users } from "lucide-react";

import MainContainer from "~/components/main-container";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { requirePermission } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:iam");

  return null;
}

export default function IamLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <MainContainer>
      <h1 className="sr-only">Identity & Access Management</h1>
      <Tabs
        className="mb-4"
        defaultValue={location.pathname.split("/")[3]}
        onValueChange={(v) => navigate(`/app/iam/${v}`)}
      >
        <TabsList className="gap-1">
          <TabsTrigger className="pl-6 pr-8 hover:bg-background" value="users">
            <Users className="h-4 w-4 mr-2" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger className="pl-6 pr-8 hover:bg-background" value="roles">
            <UserCheck2 className="h-4 w-4 mr-2" />
            <span>Roles</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Outlet />
    </MainContainer>
  );
}

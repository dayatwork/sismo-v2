import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";

import MainContainer from "~/components/main-container";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getUsersWages } from "~/services/wage.server";
import { requirePermission } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:payroll");
  const usersWithWages = await getUsersWages();

  return json({ usersWithWages });
}

export default function WagesLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <MainContainer>
      <h1 className="sr-only">Wages</h1>
      <Tabs
        className="mb-4"
        defaultValue={location.pathname.split("/")[3]}
        onValueChange={(v) => navigate(`/app/wages/${v}`)}
      >
        <TabsList className="gap-1">
          <TabsTrigger
            className="pl-6 pr-8 hover:bg-background"
            value="regular"
          >
            Regular
          </TabsTrigger>
          <TabsTrigger
            className="pl-6 pr-8 hover:bg-background"
            value="overtime"
          >
            Overtime
          </TabsTrigger>
          <TabsTrigger
            className="pl-6 pr-8 hover:bg-background"
            value="suplemental"
          >
            Suplemental
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Outlet />
    </MainContainer>
  );
}

import { type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { FileText } from "lucide-react";

import MainContainer from "~/components/main-container";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { requirePermission } from "~/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:iam");

  return null;
}

export default function OrganizationLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <MainContainer>
      <h1 className="sr-only">Organization</h1>
      <Tabs
        className="mb-4"
        defaultValue={location.pathname.split("/")[4]}
        onValueChange={(v) => navigate(`/app/organization/${v}`)}
      >
        <TabsList className="h-12">
          <TabsTrigger className="h-10 px-6" value="details">
            <FileText className="h-5 w-5 mr-2" />
            <span>Details</span>
          </TabsTrigger>
          <TabsTrigger className="h-10 px-6" value="directorate">
            <FileText className="h-5 w-5 mr-2" />
            <span>Directorate</span>
          </TabsTrigger>
          <TabsTrigger className="h-10 px-6" value="job-level">
            <FileText className="h-5 w-5 mr-2" />
            <span>Job Level</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Outlet />
    </MainContainer>
  );
}

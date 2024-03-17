import { type LoaderFunctionArgs, redirect } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const id = params.id;
  if (!id) {
    return redirect(`/app/${organizationId}/projects`);
  }

  return redirect(`/app/${organizationId}/stages/${id}/overview`);
}

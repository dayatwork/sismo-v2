import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const orgId = params.orgId;
  if (!orgId) {
    return redirect("/app");
  }
  return redirect(`/app/${orgId}/dashboard`);
}

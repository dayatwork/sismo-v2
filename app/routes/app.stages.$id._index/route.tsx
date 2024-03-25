import { type LoaderFunctionArgs, redirect } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id;
  if (!id) {
    return redirect(`/app/projects`);
  }

  return redirect(`/app/stages/${id}/overview`);
}

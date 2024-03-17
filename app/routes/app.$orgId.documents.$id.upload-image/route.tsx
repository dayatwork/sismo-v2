import { json, type ActionFunctionArgs, redirect } from "@remix-run/node";

import { requireOrganizationUser } from "~/utils/auth.server";
import { uploadDocumentImage } from "~/services/document.server";
import invariant from "tiny-invariant";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const documentId = params.id;
  if (!documentId) {
    return redirect(`/app/${organizationId}/documents`);
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }

  const formData = await request.formData();
  const file = formData.get("file");

  invariant(file instanceof File, "Invalid file");

  const { url } = await uploadDocumentImage({
    id: documentId,
    organizationId,
    userId: loggedInUser.id,
    file,
  });

  return json({ url }, { status: 200 });
}

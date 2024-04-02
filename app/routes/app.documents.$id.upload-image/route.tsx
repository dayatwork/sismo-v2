import { json, type ActionFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { requireUser } from "~/utils/auth.server";
import { uploadDocumentImage } from "~/services/document.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const documentId = params.id;
  if (!documentId) {
    return redirect(`/app/documents`);
  }

  const loggedInUser = await requireUser(request);

  const formData = await request.formData();
  const file = formData.get("file");

  invariant(file instanceof File, "Invalid file");

  const { url } = await uploadDocumentImage({
    id: documentId,
    userId: loggedInUser.id,
    file,
  });

  return json({ url }, { status: 200 });
}

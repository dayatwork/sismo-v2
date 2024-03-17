import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { json, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Modal, Dialog, Label, Button, Heading } from "react-aria-components";
import { z } from "zod";
import { parse } from "@conform-to/zod";
import { useForm } from "@conform-to/react";

import { redirectWithToast } from "~/utils/toast.server";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { authenticator } from "~/services/auth.server";
import { Input } from "~/components/ui/input";
import { createProjectAttachmentTypeFile } from "~/services/attachment.server";

const schema = z.object({
  file: z.instanceof(File, { message: "File is required" }),
  displayName: z.string().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const { id: userId } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }
  const { file, displayName } = submission.value;

  await createProjectAttachmentTypeFile({
    displayName,
    file,
    organizationId,
    projectId,
    userId,
  });

  return redirectWithToast(
    `/app/${organizationId}/projects/${projectId}/documents`,
    {
      description: `New document uploaded`,
      type: "success",
    }
  );
}

export default function UploadProjectDocument() {
  const lastSubmission = useActionData<typeof action>();
  const navigate = useNavigate();
  const { id, orgId } = useParams<{ id: string; orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onSubmit",
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/projects/${id}/documents`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form encType="multipart/form-data" method="post" {...form.props}>
          <Heading slot="title" className="text-lg font-semibold">
            Upload Document
          </Heading>
          <div className="mt-2 grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>File</Label>
              <Input id="file" name="file" type="file" />
              <p className="text-red-600 text-sm font-medium">
                {fields.file.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="displayName">Display Name</Label>
                <p className="text-muted-foreground leading-none text-sm">
                  Optional
                </p>
              </div>
              <Input id="displayName" name="displayName" type="displayName" />
              <p className="text-red-600 text-sm font-medium">
                {fields.displayName.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/${orgId}/projects/${id}/documents`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(buttonVariants())}
              isDisabled={submitting}
            >
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}

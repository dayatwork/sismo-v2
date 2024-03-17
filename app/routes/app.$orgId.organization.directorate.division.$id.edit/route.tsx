import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import { Modal, Dialog, Heading } from "react-aria-components";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { editDivision, getDivisionById } from "~/services/division.server";

const schema = z.object({
  name: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const divisionId = params.id;
  if (!divisionId) {
    return redirect(`/app/${organizationId}/organization/directorate`);
  }

  // const user = await requiredPermission(request, "manage:organization");
  // if (!user) {
  //   return redirectWithToast(`/app/organizations/${directorateId}`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  const { name } = submission.value;

  await editDivision({ id: divisionId, name, organizationId });

  return redirectWithToast(`/app/${organizationId}/organization/directorate`, {
    type: "success",
    description: "Division created",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const divisionId = params.id;
  if (!divisionId) {
    return redirect(`/app/${organizationId}/organization/directorate`);
  }

  // const user = await requiredPermission(request, "manage:organization");
  // if (!user) {
  //   return redirectWithToast(`/app/organizations/${directorateId}`, {
  //     description: "Forbidden",
  //     type: "error",
  //   });
  // }

  const division = await getDivisionById({ id: divisionId, organizationId });

  if (!division) {
    return redirect(`/app/${organizationId}/organization/directorate`);
  }

  return json({ division });
}

export default function EditDivision() {
  const lastSubmission = useActionData<typeof action>();
  const { division } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onSubmit",
    defaultValue: {
      name: division.name,
    },
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/organization/directorate`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" {...form.props}>
          <Heading slot="title" className="text-lg font-semibold">
            Edit division
          </Heading>
          <div className="mt-2 grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoFocus
                name="name"
                defaultValue={fields.name.defaultValue}
              />
              {fields.name.errors ? (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {fields.name.errors}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/organization/directorate`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving" : "Save"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}

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
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import {
  Modal,
  Dialog,
  Label,
  Button,
  Select,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  Heading,
} from "react-aria-components";

import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { requirePermission } from "~/utils/auth.server";
import {
  editProjectServiceOrProduct,
  getProjectById,
} from "~/services/project.server";
import { getServices } from "~/services/service.server";
import { getProducts } from "~/services/product.server";
import { ChevronDownIcon } from "lucide-react";
import { labelVariants } from "~/components/ui/label";
import { selectClassName } from "~/components/ui/select";

const schema = z.object({
  serviceId: z.string().optional(),
  productId: z.string().optional(),
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

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:project"
  );
  if (!loggedInUser) {
    return redirect("/app");
  }

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  const { serviceId, productId } = submission.value;

  await editProjectServiceOrProduct({
    organizationId,
    projectId,
    serviceId,
    productId,
  });

  return redirectWithToast(
    `/app/${organizationId}/projects/${projectId}/overview`,
    {
      description: `Project edited`,
      type: "success",
    }
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:project"
  );
  if (!loggedInUser) {
    return redirect("/app");
  }

  const project = await getProjectById({ id: projectId, organizationId });
  if (!project) {
    return redirect(`/app/${organizationId}/projects`);
  }

  const [services, products] = await Promise.all([
    getServices({ organizationId }),
    getProducts({ organizationId }),
  ]);

  return json({ project, services, products });
}

export default function EditServiceProduct() {
  const lastSubmission = useActionData<typeof action>();
  const { project, services, products } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
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
      onOpenChange={() =>
        navigate(`/app/${orgId}/projects/${project.id}/overview`)
      }
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" {...form.props}>
          <Heading slot="title" className="text-lg font-semibold">
            Edit Service & Product
          </Heading>
          <div className="mt-4 grid gap-4 py-4">
            <div className="grid gap-2">
              <Select
                name="serviceId"
                defaultSelectedKey={project.serviceId || undefined}
              >
                <Label className={labelVariants()}>Select Service</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                    {services.map((service) => (
                      <ListBoxItem
                        key={service.id}
                        id={service.id}
                        value={{ id: service.id }}
                        className="px-1 py-1.5 text-sm font-semibold rounded flex justify-between items-center cursor-pointer hover:bg-accent"
                      >
                        {service.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.serviceId.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Select
                name="productId"
                defaultSelectedKey={project.productId || undefined}
              >
                <Label className={labelVariants()}>Select Product</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                    {products.map((product) => (
                      <ListBoxItem
                        key={product.id}
                        id={product.id}
                        value={{ id: product.id }}
                        className="px-1 py-1.5 text-sm font-semibold rounded flex justify-between items-center cursor-pointer hover:bg-accent"
                      >
                        {product.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.productId.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() =>
                navigate(`/app/${orgId}/projects/${project.id}/overview`)
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(buttonVariants())}
              isDisabled={submitting}
            >
              {submitting ? "Saving" : "Save"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}

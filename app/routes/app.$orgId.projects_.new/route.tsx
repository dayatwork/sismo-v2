import {
  Form,
  Link,
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

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { Textarea } from "~/components/ui/textarea";
import { createNewProject } from "~/services/project.server";
import { requirePermission } from "~/utils/auth.server";
import MainContainer from "~/components/main-container";
import { getServices } from "~/services/service.server";
import { getProducts } from "~/services/product.server";
import { getOrganizationUsers } from "~/services/user.server";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const schema = z.object({
  name: z.string(),
  code: z.string().optional(),
  description: z.string().optional(),
  championId: z.string().optional(),
  serviceId: z.string().optional(),
  productId: z.string().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
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

  const { name, description, code, championId, productId, serviceId } =
    submission.value;

  await createNewProject({
    name,
    description,
    code,
    organizationId,
    championId,
    productId,
    serviceId,
  });

  return redirectWithToast(`/app/${organizationId}/projects`, {
    description: `New project created`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:project"
  );
  if (!loggedInUser) {
    return redirect("/app");
  }

  const [services, products, organizationUsers] = await Promise.all([
    getServices({ organizationId }),
    getProducts({ organizationId }),
    getOrganizationUsers(organizationId),
  ]);

  return json({ services, products, organizationUsers });
}

export default function CreateNewProject() {
  const lastSubmission = useActionData<typeof action>();
  const { organizationUsers, products, services } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onSubmit",
  });

  return (
    <MainContainer>
      <Link
        to={`/app/${orgId}/projects`}
        className="hover:underline text-muted-foreground"
      >
        &larr; Back to projects
      </Link>
      <Form className="mt-4" method="post" {...form.props}>
        <h1 className="text-lg font-semibold mb-4">Create New Project</h1>
        <div className="grid grid-cols-2 gap-6">
          <div className="grid gap-4 p-6 rounded-md border bg-neutral-50 dark:bg-neutral-900">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                autoFocus
                name="name"
                defaultValue={fields.name.defaultValue}
                className=""
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.name.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description">Description</Label>
                <span className="text-sm text-muted-foreground leading-none">
                  optional
                </span>
              </div>
              <Textarea
                id="description"
                name="description"
                defaultValue={fields.description.defaultValue}
                className=""
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.description.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="code">Project Code</Label>
                <span className="text-sm text-muted-foreground leading-none">
                  auto generate for empty values
                </span>
              </div>
              <Input
                id="code"
                name="code"
                defaultValue={fields.code.defaultValue}
                className=""
              />
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.code.errors}
              </p>
            </div>
          </div>
          <div className="grid gap-4 p-6 rounded-md border bg-neutral-50 dark:bg-neutral-900">
            <div className="grid gap-2">
              <Label htmlFor="champion">Champion</Label>
              <Select name="championId">
                <SelectTrigger className="bg-transparent">
                  <SelectValue placeholder="Select a champion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Users</SelectLabel>
                    <SelectSeparator />
                    {organizationUsers.map((orgUser) => (
                      <SelectItem key={orgUser.userId} value={orgUser.userId}>
                        {orgUser.user.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.serviceId.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service">Service</Label>
              <Select name="serviceId">
                <SelectTrigger className="bg-transparent">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Services</SelectLabel>
                    <SelectSeparator />
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.serviceId.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product">Product</Label>
              <Select name="productId">
                <SelectTrigger className="bg-transparent">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Products</SelectLabel>
                    <SelectSeparator />
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.productId.errors}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(`/app/${orgId}/projects`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting" : "Submit"}
          </Button>
        </div>
      </Form>
    </MainContainer>
  );
}

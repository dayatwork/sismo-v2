import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
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
import { getUsers } from "~/services/user.server";

const schema = z.object({
  name: z.string(),
  code: z.string().optional(),
  description: z.string().optional(),
  championId: z.string().optional(),
  serviceId: z.string().optional(),
  productId: z.string().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  await requirePermission(request, "manage:project");

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { name, description, code, championId, productId, serviceId } =
    submission.value;

  await createNewProject({
    name,
    description,
    code,
    championId,
    productId,
    serviceId,
  });

  return redirectWithToast(`/app/projects`, {
    description: `New project created`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:project");

  const [services, products, users] = await Promise.all([
    getServices(),
    getProducts(),
    getUsers(),
  ]);

  return json({ services, products, users });
}

export default function CreateNewProject() {
  const lastResult = useActionData<typeof action>();
  const { users, products, services } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <MainContainer>
      <Link
        to={`/app/projects`}
        className="hover:underline text-muted-foreground"
      >
        &larr; Back to projects
      </Link>
      <Form
        className="mt-4"
        method="post"
        id={form.id}
        onSubmit={form.onSubmit}
      >
        <h1 className="text-lg font-semibold mb-4">Create New Project</h1>
        <div className="grid grid-cols-2 gap-6">
          <div className="grid gap-4 p-6 rounded-md border bg-neutral-50 dark:bg-neutral-900">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                autoFocus
                name="name"
                defaultValue={fields.name.initialValue}
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
                defaultValue={fields.description.initialValue}
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
                defaultValue={fields.code.initialValue}
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
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
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
            onClick={() => navigate(`/app/projects`)}
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

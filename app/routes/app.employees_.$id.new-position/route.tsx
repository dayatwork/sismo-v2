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
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import {
  Modal,
  Dialog,
  Select,
  Label,
  Button,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  Heading,
} from "react-aria-components";

import { redirectWithToast } from "~/utils/toast.server";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { labelVariants } from "~/components/ui/label";
import { selectClassName } from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { createEmployeePosition } from "~/services/employee.server";
import { getDirectorates } from "~/services/directorate.server";
import { getJobLevels } from "~/services/job-level.server";
import { requirePermission } from "~/utils/auth.server";

const schema = z.object({
  jobLevelId: z.string(),
  divisionId: z.string(),
  directorateId: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = params.id;
  if (!userId) return redirect(`/app/employees`);

  await requirePermission(request, "manage:employee");

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { divisionId, jobLevelId } = submission.value;

  await createEmployeePosition({
    divisionId,
    jobLevelId,
    userId,
  });

  return redirectWithToast(`/app/employees/${userId}`, {
    description: `New position created`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.id;
  if (!employeeId) return redirect(`/app/employees`);

  await requirePermission(request, "manage:employee");

  const [directorates, jobLevels] = await Promise.all([
    getDirectorates(),
    getJobLevels(),
  ]);

  return json({ directorates, jobLevels });
}

type Division = {
  id: string;
  name: string;
};

export default function AddEmployeePosition() {
  const lastResult = useActionData<typeof action>();
  const { directorates, jobLevels } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [divisions, setDivisions] = useState<Division[]>([]);
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
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/employees/${id}`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <Heading slot="title" className="text-lg font-semibold">
            Add position
          </Heading>
          <div className="mt-2 grid gap-4 py-4">
            <div className="grid gap-2">
              <Select
                name="directorateId"
                onSelectionChange={(directorateId) => {
                  const newDivisions =
                    directorates.find(
                      (directorate) => directorate.id === directorateId
                    )?.divisions || [];
                  setDivisions(newDivisions);
                }}
              >
                <Label className={labelVariants()}>Directorate</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm shadow-lg dark:shadow-white/10 ">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                    {directorates.map((directorate) => (
                      <ListBoxItem
                        key={directorate.id}
                        id={directorate.id}
                        value={{ id: directorate.id }}
                        className="px-1 py-1.5 text-sm font-semibold cursor-pointer hover:bg-accent rounded"
                      >
                        {directorate.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.directorateId.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Select name="divisionId" className="grid gap-2">
                <Label className={labelVariants()}>Division</Label>
                <Button className={selectClassName}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm shadow-lg dark:shadow-white/10">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1">
                    {divisions.map((division) => (
                      <ListBoxItem
                        key={division.id}
                        id={division.id}
                        value={{ id: division.id }}
                        className="px-1 py-1.5 text-sm font-semibold cursor-pointer hover:bg-accent rounded"
                      >
                        {division.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.divisionId.errors}
              </p>
            </div>
            <div className="grid gap-2">
              <Select name="jobLevelId">
                <Label className={labelVariants()}>Job Level</Label>
                <Button className={cn(selectClassName, "mt-1")}>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDownIcon className="w-4 h-4" />
                  </span>
                </Button>
                <Popover className="-mt-1 w-full max-w-sm shadow-lg dark:shadow-white/10">
                  <ListBox className="border p-2 rounded-md bg-background space-y-1 ">
                    {jobLevels.map((jobLevel) => (
                      <ListBoxItem
                        key={jobLevel.id}
                        id={jobLevel.id}
                        value={{ id: jobLevel.id }}
                        className="px-1 py-1.5 text-sm font-semibold cursor-pointer hover:bg-accent rounded"
                      >
                        {jobLevel.name}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
              <p className="-mt-1.5 text-sm text-red-600 font-semibold">
                {fields.jobLevelId.errors}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }))}
              onPress={() => navigate(`/app/employees/${id}`)}
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

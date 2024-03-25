import {
  Form,
  useActionData,
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
import { Modal, Dialog, Label, Button, Heading } from "react-aria-components";

import { labelVariants } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { updateDocumentCover } from "~/services/document.server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { requireUser } from "~/utils/auth.server";

// const schema = z.object({
//   url: z.string(),

// });
const schema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("link"), url: z.string() }),
  z.object({
    type: z.literal("file"),
    file: z.instanceof(File, { message: "File is required" }),
  }),
]);

export async function action({ request, params }: ActionFunctionArgs) {
  const documentId = params.id;
  if (!documentId) {
    return redirect(`/app/documents`);
  }

  const loggedInUser = await requireUser(request);

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  await updateDocumentCover({
    id: documentId,
    userId: loggedInUser.id,
    ...submission.value,
  });

  return redirectWithToast(`/app/documents/${documentId}`, {
    description: `Cover image changed`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const documentId = params.id;
  if (!documentId) {
    return redirect(`/app/documents`);
  }

  await requireUser(request);

  return null;
}

export default function ChangeDocumentCover() {
  const lastResult = useActionData<typeof action>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onSubmit",
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/documents/${id}`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Heading slot="title" className="text-lg font-semibold">
          Change cover image
        </Heading>
        <Tabs className="mt-4" defaultValue="file">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="file">File</TabsTrigger>
            <TabsTrigger value="link">URL</TabsTrigger>
          </TabsList>
          <TabsContent className="mt-4" value="file">
            <Form
              encType="multipart/form-data"
              method="post"
              id={form.id}
              onSubmit={form.onSubmit}
            >
              <input type="hidden" name="type" value="file" />
              <div className="grid gap-2">
                <Label htmlFor="url" className={labelVariants()}>
                  File
                </Label>
                <Input id="file" name="file" type="file" />
                {fields.file.errors ? (
                  <p
                    role="alert"
                    className="text-sm font-semibold text-red-600"
                  >
                    {fields.file.errors}
                  </p>
                ) : null}
              </div>
              <div className="mt-8 flex justify-end gap-2 w-full">
                <Button
                  type="button"
                  className={cn(buttonVariants({ variant: "ghost" }))}
                  onPress={() => navigate(`/app/documents/${id}`)}
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
          </TabsContent>
          <TabsContent className="mt-4" value="link">
            <Form method="post" id={form.id} onSubmit={form.onSubmit}>
              <input type="hidden" name="type" value="link" />
              <div className="grid gap-2">
                <Label htmlFor="url" className={labelVariants()}>
                  Url
                </Label>
                <Input id="url" autoFocus name="url" type="url" />
                {fields.url.errors ? (
                  <p
                    role="alert"
                    className="text-sm font-semibold text-red-600"
                  >
                    {fields.url.errors}
                  </p>
                ) : null}
              </div>
              <div className="mt-8 flex justify-end gap-2 w-full">
                <Button
                  type="button"
                  className={cn(buttonVariants({ variant: "ghost" }))}
                  onPress={() => navigate(`/app/documents/${id}`)}
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
          </TabsContent>
        </Tabs>
      </Dialog>
    </Modal>
  );
}

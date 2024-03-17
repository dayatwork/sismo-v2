import {
  redirect,
  type LoaderFunctionArgs,
  json,
  type ActionFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Plus, Send, Trash2 } from "lucide-react";
import { z } from "zod";
import { parse } from "@conform-to/zod";
import { useFieldList, useForm, list } from "@conform-to/react";
import ShortUniqueId from "short-unique-id";

import Tiptap from "~/components/tiptap";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label, labelVariants } from "~/components/ui/label";
import { MultiSelect } from "~/components/ui/multi-select";
import { getOrganizationUsers } from "~/services/user.server";
import { requireOrganizationUser } from "~/utils/auth.server";
import { redirectWithToast } from "~/utils/toast.server";
import { Separator } from "~/components/ui/separator";
import { createNotificationForManyUsers } from "~/services/notification.server";
import { emitter } from "~/utils/sse/emitter.server";
import { createMailForManyReceivers } from "~/services/mail.server";

const schema = z.object({
  subject: z.string().min(1, "Required"),
  receiverIds: z.string().min(1, "Required"),
  body: z.string(),
  attachments: z.array(z.instanceof(File)).optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  console.log("HIT");
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json({ submission, error: null });
  }

  const {
    body,
    receiverIds: _receiverIdsString,
    subject,
    attachments,
  } = submission.value;

  const receiverIds = _receiverIdsString.split(",");

  const uid = new ShortUniqueId({ length: 8 });

  console.log({ attachments });

  try {
    await createMailForManyReceivers({
      code: uid.rnd(),
      body,
      subject,
      organizationId,
      senderId: loggedInUser.id,
      receiverIds,
      attachments,
    });

    await createNotificationForManyUsers({
      link: `/app/${organizationId}/mail/inbox`,
      receiverIds,
      title: "New inbox",
      description: subject,
      type: "MAIL",
    });

    receiverIds.forEach((id) => {
      emitter.emit(`notifications-${id}-new`);
    });

    return redirectWithToast(`/app/${organizationId}/mail/inbox`, {
      description: "Mail sent",
    });
  } catch (error) {
    return json({ submission, error: JSON.stringify(error) });
  }
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }
  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }
  const organizationUsers = await getOrganizationUsers(organizationId);

  const userOptions = await organizationUsers
    .filter((orgUser) => orgUser.userId !== loggedInUser.id)
    .map((orgUser) => ({
      label: orgUser.user.name,
      value: orgUser.user.id,
    }));

  return json({ userOptions });
}

export default function NewMail() {
  const actionData = useActionData<typeof action>();
  const { userOptions } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, fields] = useForm({
    lastSubmission: actionData?.submission,
    shouldValidate: "onSubmit",
    onValidate({ formData }) {
      return parse(formData, { schema });
    },
  });
  const attachmentList = useFieldList(form.ref, fields.attachments);

  return (
    <div className="mt-10 max-w-4xl mx-auto border rounded-md bg-neutral-50 dark:bg-neutral-900">
      <h1 className="font-semibold text-xl px-10 py-6">New Mail</h1>
      <Separator />
      <Form
        className="p-10"
        encType="multipart/form-data"
        method="POST"
        {...form.props}
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Subject</Label>
            <Input
              name="subject"
              className="bg-background px-5 text-base h-10 focus-visible:outline-none focus-visible:ring-0"
              placeholder="Subject"
            />
            <p className="-mt-1.5 text-sm text-red-600 font-semibold">
              {fields.subject.errors}
            </p>
          </div>
          <div className="grid gap-2">
            <Label>To</Label>
            <MultiSelect
              name="receiverIds"
              className="bg-background focus-within:ring-0 focus-within:ring-offset-0"
              options={userOptions}
              placeholder="Send to"
            />
            <p className="-mt-1.5 text-sm text-red-600 font-semibold">
              {fields.receiverIds.errors}
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Body</Label>
            <Tiptap name="body" content="" />
            <p className="-mt-1.5 text-sm text-red-600 font-semibold">
              {fields.body.errors}
            </p>
          </div>
          {!!attachmentList.length && (
            <div className="grid gap-2">
              <h3 className={labelVariants()}>Attachments</h3>
              <ul className="flex flex-col gap-1">
                {attachmentList.map((attachment, index) => (
                  <li key={attachment.key}>
                    <input type="file" name={attachment.name} />
                    <button
                      className="w-8 h-8 inline-flex items-center justify-center border rounded text-red-600"
                      {...list.remove(fields.attachments.name, { index })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-between">
          <Button variant="outline" {...list.insert(fields.attachments.name)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Attachment
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Sending" : "Send"} <Send className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </Form>
    </div>
  );
}

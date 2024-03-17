import { redirect, json, type ActionFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import { Reply, Send } from "lucide-react";
import { z } from "zod";
import { parse } from "@conform-to/zod";
import { useForm } from "@conform-to/react";

import Tiptap from "~/components/tiptap";
import { Button } from "~/components/ui/button";
import { requireOrganizationUser } from "~/utils/auth.server";
import { redirectWithToast } from "~/utils/toast.server";
import { type InboxMailDetailOutletContext } from "../app.$orgId.mail.inbox_.$id/route";
import { useLoggedInUser } from "~/utils/auth";
import { createMail, getMailById } from "~/services/mail.server";

const schema = z.object({
  body: z.string(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const loggedInUser = await requireOrganizationUser(request, organizationId);
  if (!loggedInUser) {
    return redirect("/app");
  }
  const mailId = params.id;
  if (!mailId) {
    return redirect(`/app/${organizationId}/mail`);
  }

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json({ submission, error: null });
  }

  const { body } = submission.value;

  const mail = await getMailById({ id: mailId });
  if (!mail) {
    return redirect(`/app/${organizationId}/mail`);
  }

  try {
    await createMail({
      code: mail.code,
      body,
      parentId: mail.id,
      organizationId,
      senderId: loggedInUser.id,
      receiverId:
        mail.receiverId === loggedInUser.id ? mail.senderId : mail.receiverId,
    });

    return redirectWithToast(`/app/${organizationId}/mail/inbox/${mailId}`, {
      description: "Reply sent",
    });
  } catch (error) {
    return json({ submission, error: JSON.stringify(error) });
  }
}

export default function ReplyMail() {
  const actionData = useActionData<typeof action>();
  const { inbox } = useOutletContext<InboxMailDetailOutletContext>();
  const navigate = useNavigate();
  const { id, orgId } = useParams<{ orgId: string; id: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const user = useLoggedInUser();

  const [form, fields] = useForm({
    lastSubmission: actionData?.submission,
    shouldValidate: "onSubmit",
  });

  return (
    <div className="mt-4">
      <dl className="flex gap-2 items-center pt-4 mb-2 px-1">
        <dt className="flex items-center gap-1">
          <Reply className="w-4 h-4 mr-2" />
          <span>Reply to :</span>
        </dt>
        <dd className="flex gap-2 items-center">
          <p className="font-medium">
            {user?.id === inbox.senderId
              ? inbox.receiver?.name
              : inbox.sender.name}
          </p>
          <p className="text-muted-foreground text-sm">
            {user?.id === inbox.senderId
              ? inbox.receiver?.email
              : inbox.sender.email}
          </p>
        </dd>
      </dl>
      <Form method="post" {...form.props}>
        <Tiptap name="body" content="" />
        <p className="-mt-1.5 text-sm text-red-600 font-semibold">
          {fields.body.errors}
        </p>
        <div className="mt-8 flex justify-end">
          <Button
            variant="ghost"
            onClick={() => navigate(`/app/${orgId}/mail/inbox/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Sending" : "Send"} <Send className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </Form>
    </div>
  );
}

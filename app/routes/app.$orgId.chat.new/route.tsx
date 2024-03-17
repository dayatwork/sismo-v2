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
import { Modal, Dialog, Button, Heading } from "react-aria-components";

import { redirectWithToast } from "~/utils/toast.server";
import { requireOrganizationUser } from "~/utils/auth.server";
import { buttonVariants } from "~/components/ui/button";
import { getOrganizationUsersAndExcludeSomeIds } from "~/services/organization.server";
// import { AddableContactComboBox } from "./addable-contact-combobox";
import { AddableContactList } from "./addable-contact-list";
import { pusherServer } from "~/utils/pusher/pusher.server";
import {
  createConversation,
  getUserConversations,
} from "~/services/chat.server";

const schema = z.object({
  userId: z.string().min(1, "Required"),
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

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  const { userId } = submission.value;

  const conversation = await createConversation({
    isGroup: false,
    createdById: loggedInUser.id,
    userIds: [userId, loggedInUser.id],
  });

  conversation.users.forEach((user) => {
    pusherServer.trigger(user.id, "conversation:new", conversation);
  });

  return redirectWithToast(`/app/${organizationId}/chat/${conversation.id}`, {
    description: `New contact added`,
    type: "success",
  });
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

  const conversations = await getUserConversations({ userId: loggedInUser.id });

  const privateConversations = conversations.filter(
    (conversation) => !conversation.isGroup
  );
  const myContactIds = privateConversations.map(
    (conversation) =>
      conversation.users.filter((user) => user.id !== loggedInUser.id)[0].id
  );

  const organizationUsers = await getOrganizationUsersAndExcludeSomeIds({
    organizationId,
    excludeIds: [...myContactIds, loggedInUser.id],
  });

  const addableContacts = organizationUsers.map((orgUser) => ({
    id: orgUser.userId,
    name: orgUser.user.name,
    photo: orgUser.user.photo,
  }));

  return json({ addableContacts });
}

export default function CreateContact() {
  const lastSubmission = useActionData<typeof action>();
  const { addableContacts } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form] = useForm({
    lastSubmission,
    shouldValidate: "onSubmit",
  });

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/${orgId}/chat`)}
      className="overflow-hidden w-full max-w-sm"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" {...form.props}>
          <Heading slot="title" className="text-lg font-semibold mb-4">
            Add new contact
          </Heading>
          <div>
            {/* <AddableContactComboBox
              name="userId"
              contacts={addableContacts}
              errorMessage={lastSubmission?.error.userId.toString()}
            />
            <p className="mt-0.5 text-sm font-semibold text-red-600">
              {lastSubmission?.error.userId.toString()}
            </p> */}
            {addableContacts.length > 0 ? (
              <>
                {" "}
                <AddableContactList contacts={addableContacts} name="userId" />
                <p className="mt-0.5 text-sm font-semibold text-red-600">
                  {lastSubmission?.error.userId.toString()}
                </p>
              </>
            ) : (
              <p className="px-3 py-1 text-sm font-semibold  rounded-md bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
                No users can be added to your contacts
              </p>
            )}
          </div>
          <div className="mt-8 flex justify-end gap-2 w-full">
            <Button
              type="button"
              className={buttonVariants({ variant: "ghost" })}
              onPress={() => navigate(`/app/${orgId}/chat`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={buttonVariants()}
              isDisabled={submitting || addableContacts.length === 0}
            >
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}

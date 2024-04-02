import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { Modal, Dialog, Button, Heading } from "react-aria-components";

import { redirectWithToast } from "~/utils/toast.server";
import { buttonVariants } from "~/components/ui/button";
import { AddableContactList } from "./addable-contact-list";
import { pusherServer } from "~/utils/pusher/pusher.server";
import {
  createConversation,
  getUserConversations,
} from "~/services/chat.server";
import { requireUser } from "~/utils/auth.server";
import { getUsersAndExcludeSomeIds } from "~/services/user.server";

const schema = z.object({
  userId: z.string().min(1, "Required"),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const loggedInUser = await requireUser(request);

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
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

  return redirectWithToast(`/app/chat/${conversation.id}`, {
    description: `New contact added`,
    type: "success",
  });
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);
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

  const users = await getUsersAndExcludeSomeIds({
    excludeIds: [...myContactIds, loggedInUser.id],
  });

  const addableContacts = users.map((user) => ({
    id: user.id,
    name: user.name,
    photo: user.photo,
  }));

  return json({ addableContacts });
}

export default function CreateContact() {
  const lastResult = useActionData<typeof action>();
  const { addableContacts } = useLoaderData<typeof loader>();
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
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/chat`)}
      className="overflow-hidden w-full max-w-sm"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
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
                <AddableContactList contacts={addableContacts} name="userId" />
                <p className="mt-0.5 text-sm font-semibold text-red-600">
                  {fields.userId.errors}
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
              onPress={() => navigate(`/app/chat`)}
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

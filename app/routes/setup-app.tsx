import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, redirect, json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { AuthorizationError } from "remix-auth";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { redirectWithToast } from "~/utils/toast.server";
import {
  authenticator,
  createSuperAdmin,
  hasSuperAdmin,
} from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";

const setupSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Email is invalid"),
  password: z.string({ required_error: "Password is required" }),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: setupSchema });

  if (submission.status !== "success") {
    return json({ error: "", submission: submission.reply() });
  }

  const { email, password } = submission.value;

  try {
    const user = await createSuperAdmin({ email, password });

    const session = await getSession(request.headers.get("cookie"));
    session.set(authenticator.sessionKey, user);

    const headers = new Headers({ "set-cookie": await commitSession(session) });

    return redirectWithToast(
      "/app",
      { description: "Login success", type: "success" },
      { headers }
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return json({
        error: error.message,
        submission,
      });
    }
    return json({ error: "Something went wrong!", submission });
  }
}

export async function loader() {
  if (await hasSuperAdmin()) {
    return redirect("/");
  }

  return null;
}

export default function SetupApp() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, { email, password }] = useForm({
    lastResult: actionData?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: setupSchema });
    },
  });

  return (
    <div className="min-h-screen grid grid-cols-2 max-w-5xl mx-auto">
      <div className="flex items-center justify-center">
        <img src="/setup.svg" alt="setup" className="max-w-[400px]" />
      </div>
      <div className="flex justify-center items-center">
        <div className="border px-6 py-8 rounded-xl w-[350px] shadow-xl dark:shadow-white/10">
          <h1 className="text-2xl font-semibold text-center">
            Setup SISMO App
          </h1>
          <p className="mt-2 mb-10 text-muted-foreground text-center">
            Create account for Super Admin
          </p>
          <Form method="post" id={form.id} onSubmit={form.onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input autoFocus id="email" type="email" name={email.name} />
              {email.errors ? (
                <p
                  role="alert"
                  className="-mt-1 text-sm text-red-600 font-semibold"
                >
                  {email.errors}
                </p>
              ) : null}
            </div>
            <div className="mt-4 grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name={password.name} />
              {password.errors ? (
                <p
                  role="alert"
                  className="-mt-1 text-sm text-red-600 font-semibold"
                >
                  {password.errors}
                </p>
              ) : null}
            </div>
            <Button className="w-full mt-8" disabled={submitting}>
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

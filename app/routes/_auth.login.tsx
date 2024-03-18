import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { AuthorizationError } from "remix-auth";

import { authenticator, hasSuperAdmin } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";
import { redirectWithToast } from "~/utils/toast.server";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Email is invalid"),
  password: z.string({ required_error: "Password is required" }),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.clone().formData();
  const submission = parseWithZod(formData, { schema: loginSchema });

  if (submission.status !== "success") {
    return json({ error: "", submission: submission.reply() });
  }
  // console.log("hit");

  try {
    const user = await authenticator.authenticate("form", request, {
      throwOnError: true,
    });
    console.log({ user });

    const session = await getSession(request.headers.get("cookie"));
    session.set(authenticator.sessionKey, user);

    const headers = new Headers({ "set-cookie": await commitSession(session) });

    return redirectWithToast(
      "/app",
      { description: "Login success", type: "success" },
      { headers }
    );
  } catch (error) {
    console.log("error:", error);
    if (error instanceof AuthorizationError) {
      return json({
        error: error.message,
        submission: "",
      });
    }
    return json({ error: "Something went wrong!", submission: "" });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/app",
  });
  if (!(await hasSuperAdmin())) {
    return redirect("/setup-app");
  }
  return null;
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const [form, { email, password }] = useForm({
    // lastResult: actionData?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
    },
  });

  return (
    <div className="px-6 py-8 border shadow-xl dark:shadow-neutral-900 rounded-xl w-[350px] bg-background">
      <Link to="/" className="flex justify-center py-2">
        <img src="/logo.png" alt="Logo" className="w-24 dark:hidden" />
        <img
          src="/logo-dark.png"
          alt="Logo"
          className="w-24 hidden dark:block"
        />
      </Link>
      <h1 className="mb-6 text-xl font-bold text-center">
        Sign in to your account
      </h1>

      {actionData?.error ? (
        <p className="mt-2 text-sm font-semibold px-2 py-1 rounded text-red-600 border border-red-600">
          {actionData.error.toString()}
        </p>
      ) : null}

      <Form
        method="post"
        className="mt-4"
        id={form.id}
        onSubmit={form.onSubmit}
      >
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input autoFocus id="email" type="email" name={email.name} />
          {email.errors ? (
            <p role="alert" className="mt-1 text-sm text-red-600 font-semibold">
              {email.errors}
            </p>
          ) : null}
        </div>
        <div className="mt-4 grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" name={password.name} />
          {password.errors ? (
            <p role="alert" className="mt-1 text-sm text-red-600 font-semibold">
              {password.errors}
            </p>
          ) : null}
        </div>
        <Button className="w-full mt-6" disabled={submitting}>
          {submitting ? "Logging in" : "Log in"}
        </Button>
      </Form>

      <Separator className="my-6" />

      <Form action="/auth/google" method="post">
        <Button variant="outline" className="w-full" disabled={submitting}>
          <FcGoogle className="w-5 h-5 -ml-2" />
          <span className="ml-2">Continue with Google</span>
        </Button>
      </Form>
    </div>
  );
}

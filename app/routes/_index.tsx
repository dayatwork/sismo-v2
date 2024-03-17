import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import { authenticator, hasSuperAdmin } from "~/services/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "SISMO" },
    { name: "description", content: "Welcome to SISMO!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedIn = !!(await authenticator.isAuthenticated(request));

  if (!await hasSuperAdmin()) {
    return redirect('/setup-app')
  }

  return json({ loggedIn });
}

export default function Index() {
  const { loggedIn } = useLoaderData<typeof loader>();
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Welcom to SISMO</h1>

      {loggedIn ? (
        <Button asChild size="lg" className="mt-6 text-lg h-12">
          <Link to="/app">Go to app</Link>
        </Button>
      ) : (
        <Button asChild size="lg" className="mt-6 text-lg h-12">
          <Link to="/login">Login</Link>
        </Button>
      )}
    </div>
  );
}

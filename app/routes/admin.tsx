import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";

import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { ThemeSwitch } from "./action.set-theme";
import { authenticator } from "~/services/auth.server";
import ProfileDropdown from "~/components/profile-dropdown";
import { getUserById } from "~/services/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await getUserById(id);

  if (!user) {
    return await authenticator.logout(request, { redirectTo: "/login" });
  }

  if (!user.isSuperAdmin) {
    return redirect("/app");
  }

  return json({ user });
}

export default function Admin() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto">
      <header className="py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <img src="/logo.png" alt="Logo" className="dark:hidden h-9" />
          <img
            src="/logo-dark.png"
            alt="Logo"
            className="hidden dark:block h-9"
          />
          <h1 className="font-bold text-lg">Admin Panel</h1>
        </div>
        <div className="flex gap-6 items-center">
          <ThemeSwitch />
          <ProfileDropdown name={user.name} photo={user.photo} />
        </div>
      </header>
      <Separator />
      <div className="mt-4 flex gap-10 items-start">
        <nav className="flex flex-col gap-2 w-[200px] border rounded p-4">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              cn(
                "font-semibold py-2 px-4 rounded-sm hover:bg-accent",
                isActive &&
                  "bg-primary/10 dark:bg-neutral-900 hover:bg-primary/20 dark:hover:bg-neutral-800"
              )
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/organizations"
            className={({ isActive }) =>
              cn(
                "font-semibold py-2 px-4 rounded-sm hover:bg-accent",
                isActive &&
                  "bg-primary/10 dark:bg-neutral-900 hover:bg-primary/20 dark:hover:bg-neutral-800"
              )
            }
          >
            Organizations
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              cn(
                "font-semibold py-2 px-4 rounded-sm hover:bg-accent",
                isActive &&
                  "bg-primary/10 dark:bg-neutral-900 hover:bg-primary/20 dark:hover:bg-neutral-800"
              )
            }
          >
            Users
          </NavLink>
        </nav>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

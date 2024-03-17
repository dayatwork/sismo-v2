import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { KeyRoundIcon, PenSquareIcon, UploadCloudIcon } from "lucide-react";

import AppLogo from "~/components/app-logo";
import ProfileDropdown from "~/components/profile-dropdown";
import { authenticator } from "~/services/auth.server";
import { getUserById } from "~/services/user.server";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { buttonVariants } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { ThemeSwitch } from "../action.set-theme";

export async function loader({ request }: LoaderFunctionArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await getUserById(id);

  if (!user) {
    return await authenticator.logout(request, { redirectTo: "/login" });
  }

  return json({ user });
}

export default function YourProfile() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto">
      <Outlet />
      <header className="flex justify-between items-center">
        <Link to="/app">
          <AppLogo />
        </Link>
        <div className="flex gap-6 items-center">
          <ThemeSwitch />
          <ProfileDropdown name={user.name} photo={user.photo} />
        </div>
      </header>
      <main className="pl-6">
        <h1 className="mt-4 text-2xl font-bold tracking-tight mb-4">
          Your Profile
        </h1>

        <div className="flex gap-6">
          <div>
            <Avatar className="w-[200px] h-[200px] rounded mb-2">
              <AvatarImage
                src={
                  user.photo || `https://ui-avatars.com/api/?name=${user.name}`
                }
                className="object-cover"
              />
              <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <Link
              to="change-photo"
              className={buttonVariants({
                variant: "outline",
                className: "w-full",
              })}
            >
              <UploadCloudIcon className="w-4 h-4 mr-2" />
              Change Photo
            </Link>
          </div>
          <div className="flex-1 space-y-6">
            <div className="border py-4 px-6 rounded-md bg-neutral-50 dark:bg-neutral-900">
              <div>
                <h2 className="font-semibold text-lg">Personal Information</h2>
                <p className="text-muted-foreground">
                  This information will be displayed publicly so be careful what
                  you share.
                </p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4 pb-2">
                <div className="font-semibold flex items-center">
                  <dt className="text-muted-foreground w-52">Name</dt>
                  <dd>{user.name}</dd>
                </div>
                <div className="font-semibold flex items-center">
                  <dt className="text-muted-foreground w-52">Email</dt>
                  <dd className="flex-1 flex justify-between items-center">
                    {user.email}
                  </dd>
                </div>
                <div className="font-semibold flex items-center">
                  <dt className="text-muted-foreground w-52">Phone Number</dt>
                  <dd className="flex-1 flex justify-between items-center">
                    <span>{user.phone}</span>
                    <Link
                      to="edit-phone"
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      <PenSquareIcon className="w-4 h-4" />
                      <span className="sr-only">Edit phone number</span>
                    </Link>
                  </dd>
                </div>
              </div>
            </div>

            {user.hasPassword ? (
              <div className="border py-4 px-6 rounded-md bg-neutral-50 dark:bg-neutral-900">
                <div>
                  <h2 className="font-semibold text-lg">Change Password</h2>
                  <p className="text-muted-foreground">
                    You will be automatically logged out after changing the
                    password
                  </p>
                </div>

                <Separator className="my-4" />
                <Link
                  to="change-password"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <KeyRoundIcon className="w-4 h-4 mr-2" /> Change Password
                </Link>
              </div>
            ) : (
              <div className="border py-4 px-6 rounded-md bg-neutral-50 dark:bg-neutral-900">
                <div>
                  <h2 className="font-semibold text-lg">Set Password</h2>
                  <p className="text-muted-foreground">
                    You will be automatically logged out after setting the
                    password
                  </p>
                </div>

                <Separator className="my-4" />
                <Link
                  to="set-password"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <KeyRoundIcon className="w-4 h-4 mr-2" /> Set Password
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

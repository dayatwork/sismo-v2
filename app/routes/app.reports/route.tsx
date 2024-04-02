import { type LoaderFunctionArgs, json } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";

import { UserComboBox } from "~/components/comboboxes/user-combobox";
import MainContainer from "~/components/main-container";
import { requirePermission } from "~/utils/auth.server";
import { cn } from "~/lib/utils";
import { getUsers } from "~/services/user.server";

const NAVS = [
  {
    label: "Daily Report",
    href: "daily",
  },
  {
    label: "Weekly Report",
    href: "weekly",
  },
  {
    label: "Monthly Report",
    href: "monthly",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:employee");

  const users = await getUsers();

  return json({ users });
}

export default function ReportsLayout() {
  const { users } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedUser = searchParams.get("userId");

  const handleSelectUser = (userId: string) => {
    setSearchParams((params) => {
      params.set("userId", userId);
      return params;
    });
  };

  return (
    <MainContainer>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
      </div>
      <div className="mt-6 mb-4 flex justify-between items-end">
        <nav className="flex gap-2">
          {NAVS.map((nav) => (
            <NavLink
              to={
                selectedUser ? `${nav.href}?userId=${selectedUser}` : nav.href
              }
              key={nav.href}
              className={({ isActive }) =>
                cn(
                  "border p-4 rounded font-semibold hover:bg-accent",
                  isActive && "bg-white/10"
                )
              }
            >
              {nav.label}
            </NavLink>
          ))}
        </nav>
        <UserComboBox
          hideLabel
          name="userId"
          users={users}
          defaultValue={selectedUser || undefined}
          handleSearchParam={handleSelectUser}
        />
      </div>

      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Outlet context={{ users }} />
        </div>
      </div>
    </MainContainer>
  );
}

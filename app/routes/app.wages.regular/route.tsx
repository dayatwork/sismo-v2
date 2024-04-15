import { Link, Outlet, useRouteLoaderData } from "@remix-run/react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { buttonVariants } from "~/components/ui/button";
import { currencyFormatter } from "~/utils/currency";
import { type loader as wagesLoader } from "../app.wages/route";
import { Badge } from "~/components/ui/badge";

export default function RegularWages() {
  const loaderData = useRouteLoaderData<typeof wagesLoader>("routes/app.wages");

  return (
    <>
      <Outlet />
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Regular Wages</h1>
      </div>
      <ul className="space-y-1">
        {loaderData?.usersWithWages.map((user) => (
          <li
            key={user.id}
            className="flex justify-between items-center border py-2 px-4 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user.photo || ""} className="object-cover" />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{user.name}</span>
            </div>
            {user.regularWage ? (
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    user.regularWage.type === "HOURLY" ? "blue" : "green"
                  }
                  className="uppercase tracking-wider"
                >
                  {user.regularWage.type === "HOURLY"
                    ? "Hourly Wage"
                    : "Salary Wage"}
                </Badge>
                <p className="w-56 text-right font-semibold">
                  {currencyFormatter("IDR", user.regularWage.amount)} /{" "}
                  <span className="w-14 inline-block text-left">
                    {user.regularWage.type === "HOURLY" ? "hour" : "month"}
                  </span>
                </p>
              </div>
            ) : (
              <Link
                to={`${user.id}/set-wage`}
                className={buttonVariants({ variant: "outline" })}
              >
                Set Regular Wage
              </Link>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

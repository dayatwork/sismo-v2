import { Link, Outlet, useRouteLoaderData } from "@remix-run/react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { buttonVariants } from "~/components/ui/button";
import { currencyFormatter } from "~/utils/currency";
import { type loader as wagesLoader } from "../app.wages/route";
import { Badge } from "~/components/ui/badge";

export default function OvertimeWages() {
  const loaderData = useRouteLoaderData<typeof wagesLoader>("routes/app.wages");

  return (
    <>
      <Outlet />
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Overtime Wages</h1>
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
            {user.overtimeWage ? (
              <div className="flex items-center gap-4">
                {user.overtimeWage.maxOvertime ? (
                  <Badge variant="orange" className="uppercase">
                    Max : {user.overtimeWage.maxOvertime} hours
                  </Badge>
                ) : null}

                <p className="w-52 text-right font-semibold">
                  {currencyFormatter("IDR", user.overtimeWage.amount)} /{" "}
                  <span className="w-14 inline-block text-left">hour</span>
                </p>
              </div>
            ) : (
              <Link
                to={`${user.id}/set-wage`}
                className={buttonVariants({ variant: "outline" })}
              >
                Set Overtime Wage
              </Link>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

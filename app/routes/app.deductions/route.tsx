import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { buttonVariants } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import MainContainer from "~/components/main-container";
import { requirePermission } from "~/utils/auth.server";
import { currencyFormatter } from "~/utils/currency";
import {
  getDeductionNames,
  getUsersDeductions,
} from "~/services/deduction.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:payroll");
  const usersWithDeductions = await getUsersDeductions();
  const deductionNames = await getDeductionNames();

  return json({ usersWithDeductions, deductionNames });
}

export default function Deductions() {
  const { usersWithDeductions } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Deductions</h1>
        </div>
        <ul className="space-y-2">
          {usersWithDeductions.map((user) => (
            <li key={user.id} className="border rounded-lg">
              <div className="flex justify-between items-center py-2 px-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={user.photo || ""}
                      className="object-cover"
                    />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{user.name}</span>
                </div>
                <Link
                  to={`${user.id}/new-deduction`}
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  <Plus className="mr-2 w-3.5 h-3.5" /> Deduction
                </Link>
              </div>
              <Separator />
              {user.deductions.length > 0 ? (
                <div>
                  <ul className="py-4 px-4 list-disc space-y-2">
                    {user.deductions.map((deduction, index) => (
                      <li
                        key={deduction.id}
                        className="flex items-center justify-between pl-12"
                      >
                        <div className="flex items-center gap-2">
                          <p className="w-5 text-right inline-block">
                            {index + 1}.
                          </p>
                          <p>{deduction.name.name}</p>
                        </div>
                        <div className="flex gap-4 items-center">
                          {deduction.fixed && <Badge>Fixed</Badge>}{" "}
                          <p className="w-52 text-right font-semibold">
                            {currencyFormatter("IDR", deduction.amount)} /{" "}
                            <span className="w-14 inline-block text-left">
                              month
                            </span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Separator />
                  <div className="py-2 px-4 flex justify-between items-center">
                    <p className="pl-14 font-semibold">Total</p>
                    <p className="w-52 text-right font-semibold">
                      {currencyFormatter(
                        "IDR",
                        user.deductions.reduce(
                          (acc, curr) => acc + curr.amount,
                          0
                        )
                      )}{" "}
                      /{" "}
                      <span className="w-14 inline-block text-left">month</span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center py-4 px-4  text-muted-foreground text-sm">
                  No deductions
                </p>
              )}
            </li>
          ))}
        </ul>
      </MainContainer>
    </>
  );
}

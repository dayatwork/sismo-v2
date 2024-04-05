import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { LayoutDashboard, Lock, PenSquare, RotateCcw } from "lucide-react";

import MainContainer from "~/components/main-container";
import { requirePermission } from "~/utils/auth.server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { buttonVariants } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { currencyFormatter } from "~/utils/currency";
import { getPayrollById } from "~/services/payroll.server";
import { monthName } from "../app.payroll/route";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const payrollId = params.id;
  if (!payrollId) {
    return redirect("/app/payroll");
  }

  await requirePermission(request, "manage:payroll");

  const payroll = await getPayrollById({ payrollId });

  if (!payroll) {
    return redirect("/app/payroll");
  }

  return json({ payroll });
}

export default function Payroll() {
  const { payroll } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <MainContainer>
        <Breadcrumb>
          <BreadcrumbList className="mb-4">
            <BreadcrumbItem>
              <BreadcrumbLink href="/app/dashboard">
                <span className="sr-only">Dashboard</span>
                <LayoutDashboard className="w-5 h-5" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/app/payroll`}>Payroll</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {payroll.type === "MONTHLY_SALARY" ? "Monthly Salary" : "THR"}{" "}
                {monthName[payroll.month]} {payroll.year}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between mb-4 pr-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {payroll.type === "MONTHLY_SALARY" ? "Monthly Salary" : "THR"}{" "}
            {monthName[payroll.month]} {payroll.year}
          </h1>

          <div className="flex gap-6 items-center">
            {payroll.locked && (
              <p className="bg-green-600/20 text-green-600 border-green-600/30 inline-flex items-center py-2 pl-6 pr-8 rounded-lg font-bold tracking-wide">
                <Lock className="w-5 h-5 mr-2" />
                LOCKED
              </p>
            )}
            <p className="text-2xl font-semibold">
              Total:{" "}
              {currencyFormatter(
                "IDR",
                payroll.transactions.reduce((acc, curr) => acc + curr.total, 0)
              )}
            </p>
          </div>
        </div>
        {payroll.transactions.length === 0 ? (
          <div className="h-60 border-2 rounded-xl border-dashed flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4">No transactions</p>
            <Link
              to="generate-all"
              className={buttonVariants({ variant: "outline" })}
            >
              Generate Transactions For All User
            </Link>
          </div>
        ) : (
          <ul className="space-y-2 mt-6">
            {payroll.transactions.map((transaction) => (
              <li
                key={transaction.id}
                className="border rounded-lg py-2 px-4 flex justify-between items-center"
              >
                <div className="flex gap-2 items-center">
                  <Avatar>
                    <AvatarImage src={transaction.user.photo || ""} />
                    <AvatarFallback>{transaction.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{transaction.user.name}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <p className="font-semibold">
                    {currencyFormatter("IDR", transaction.total)}
                  </p>
                  {transaction.isLocked ? (
                    <div className="flex gap-2">
                      <p className="inline-flex items-center border justify-center w-24 h-8 font-semibold rounded-md text-sm border-green-600/5 text-green-600/80 bg-green-600/5">
                        <Lock className="mr-2 w-3.5 h-3.5" />
                        Locked
                      </p>
                      <Link
                        to={`transactions/${transaction.id}`}
                        className="inline-flex items-center border justify-center w-16 h-8 font-semibold rounded-md text-sm border-border hover:bg-accent transition"
                      >
                        Detail
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to={`transactions/${transaction.id}`}
                      className="inline-flex items-center border justify-center w-24 h-8 font-semibold rounded-md text-sm border-border hover:bg-accent transition"
                    >
                      <PenSquare className="mr-2 w-3.5 h-3.5" />
                      Edit
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {!payroll.locked && payroll.transactions.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <Link
              to="reset"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "text-lg"
              )}
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              Reset Payroll
            </Link>
            {payroll.transactions.filter((transaction) => !transaction.isLocked)
              .length === 0 && (
              <Link
                to="lock"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "text-lg text-green-600 border-green-600/40 hover:bg-green-600/10 hover:text-green-600"
                )}
              >
                <Lock className="w-6 h-6 mr-2" />
                Lock Payroll
              </Link>
            )}
          </div>
        )}
      </MainContainer>
    </>
  );
}

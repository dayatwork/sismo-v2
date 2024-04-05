import {
  Link,
  Outlet,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";

import MainContainer from "~/components/main-container";
import { requirePermission } from "~/utils/auth.server";
import {
  generatePayrollTransactionForAllUsers,
  getPayrollById,
} from "~/services/payroll.server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { monthName } from "../app.payroll/route";
import { LayoutDashboard, Lock, PenSquare } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { currencyFormatter } from "~/utils/currency";

export async function action({ request, params }: ActionFunctionArgs) {
  const payrollId = params.id;
  if (!payrollId) {
    return redirect("/app/payroll");
  }

  await requirePermission(request, "manage:payroll");

  try {
    await generatePayrollTransactionForAllUsers({ payrollId });
    return json({ success: true, datetime: new Date().toISOString() });
  } catch (error) {
    return json({ success: false, datetime: new Date().toISOString() });
  }
}

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
  const actionData = useActionData<typeof action>();
  const { payroll } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const generating = fetcher.state === "submitting";

  useEffect(() => {
    if (actionData?.success) {
      toast.success("Transaction generated!");
    }
  }, [actionData?.success, actionData?.datetime]);

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

          <p className="text-2xl font-semibold">
            Total:{" "}
            {currencyFormatter(
              "IDR",
              payroll.transactions.reduce((acc, curr) => acc + curr.total, 0)
            )}
          </p>
        </div>
        {payroll.transactions.length === 0 ? (
          <div className="h-60 border-2 rounded-xl border-dashed flex flex-col items-center justify-center">
            <p className="text-muted-foreground">No transactions</p>
            <fetcher.Form method="post">
              <input
                type="hidden"
                name="_intent"
                value="generate_all_transaction"
              />
              <Button
                type="submit"
                className="mt-4"
                variant="outline"
                disabled={generating}
              >
                {generating
                  ? "Generating Transaction..."
                  : "Generate Transactions For All User"}
              </Button>
            </fetcher.Form>
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
                    <p className="inline-flex items-center border justify-center w-24 h-8 font-semibold rounded-md text-sm border-green-600/5 text-green-600/80 bg-green-600/5">
                      <Lock className="mr-2 w-3.5 h-3.5" />
                      Locked
                    </p>
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
        {payroll.transactions.length > 0 && (
          <fetcher.Form method="post" className="mt-6">
            <input
              type="hidden"
              name="_intent"
              value="generate_all_transaction"
            />
            <Button type="submit" variant="outline" disabled={generating}>
              {generating
                ? "Regenerating Transaction..."
                : "Regenerate Transactions For All User"}
            </Button>
          </fetcher.Form>
        )}
      </MainContainer>
    </>
  );
}

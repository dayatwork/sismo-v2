import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import {
  LayoutDashboard,
  Lock,
  PenSquare,
  RotateCcw,
  Trash2,
} from "lucide-react";

import MainContainer from "~/components/main-container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button, buttonVariants } from "~/components/ui/button";
import { requirePermission } from "~/utils/auth.server";
import { currencyFormatter } from "~/utils/currency";
import {
  generatePayrollTransactionForAllUsers,
  getPayrollTransactionById,
} from "~/services/payroll.server";
import { monthName } from "../app.payroll/route";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

export async function action({ request, params }: ActionFunctionArgs) {
  const payrollId = params.id;
  if (!payrollId) {
    return redirect("/app/payroll");
  }

  const transactionId = params.transactionId;
  if (!transactionId) {
    return redirect(`/app/payroll/${payrollId}`);
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

  const transactionId = params.transactionId;
  if (!transactionId) {
    return redirect(`/app/payroll/${payrollId}`);
  }

  await requirePermission(request, "manage:payroll");

  const payrollTransaction = await getPayrollTransactionById({
    id: transactionId,
  });

  if (!payrollTransaction) {
    return redirect(`/app/payroll/${payrollId}`);
  }

  return json({ payrollTransaction });
}

export default function PayrollTransaction() {
  const { payrollTransaction } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  // const fetcher = useFetcher();
  // const generating = fetcher.state === "submitting";

  // useEffect(() => {
  //   if (actionData?.success) {
  //     toast.success("Transaction generated!");
  //   }
  // }, [actionData?.success, actionData?.datetime]);

  return (
    <>
      <Outlet />
      <MainContainer>
        <Breadcrumb>
          <BreadcrumbList className="mb-6">
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
              <BreadcrumbLink asChild>
                <Link to={`/app/payroll/${payrollTransaction.payrollId}`}>
                  {payrollTransaction.payroll.type === "MONTHLY_SALARY"
                    ? "Monthly Salary"
                    : "THR"}{" "}
                  {monthName[payrollTransaction.payroll.month]}{" "}
                  {payrollTransaction.payroll.year}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{payrollTransaction.user.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {payrollTransaction.isLocked && (
          <p className="bg-green-600/20 text-green-600 border-green-600/30 inline-flex items-center py-4 pl-8 pr-10 rounded-lg opacity-50 font-bold text-4xl -rotate-12 absolute top-[50%] left-[50%] -translate-y-[50%] tracking-wide">
            <Lock className="w-8 h-8 mr-2" />
            LOCKED
          </p>
        )}
        <div className="flex items-center justify-between mb-4 pr-1">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={payrollTransaction.user.photo || ""} />
              <AvatarFallback>{payrollTransaction.user.name[0]}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold tracking-tight">
              {payrollTransaction.user.name}
            </h1>
          </div>
          <p className="text-2xl font-semibold">
            Total: {currencyFormatter("IDR", payrollTransaction.total)}
          </p>
        </div>
        {payrollTransaction.transactionItems.length === 0 ? (
          <div className="h-60 border-2 rounded-xl border-dashed flex flex-col items-center justify-center">
            <p className="text-muted-foreground">No transaction items</p>
          </div>
        ) : (
          <div className="mt-6">
            <div className="border bg-foreground/5 rounded-md mb-2 px-4 py-2 flex items-center justify-between">
              <h3 className="uppercase text-lg font-bold">Wages</h3>
              {!payrollTransaction.isLocked && (
                <Link
                  to="items/new-wage"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Add Wage
                </Link>
              )}
            </div>
            <ul className="space-y-2">
              {payrollTransaction.transactionItems
                .filter((transactionItem) => transactionItem.type === "WAGE")
                .map((transactionItem) => (
                  <li
                    key={transactionItem.id}
                    className="border rounded-lg py-2 px-4 flex justify-between items-center"
                  >
                    <p className="font-semibold">{transactionItem.note}</p>
                    <div className="flex gap-6 items-center">
                      <p className="w-32 text-right">
                        {transactionItem.type === "WAGE" &&
                          currencyFormatter("IDR", transactionItem.amount)}
                      </p>
                      <span className="w-6"></span>
                      <p className="w-32 text-right"></p>
                      {payrollTransaction.isLocked ? (
                        <div className="w-[185px]" />
                      ) : (
                        <div className="ml-6 gap-2 flex items-center">
                          <Button
                            onClick={() =>
                              navigate(`items/${transactionItem.id}/edit`)
                            }
                            variant="outline"
                            size="sm"
                            disabled={!transactionItem.editable}
                          >
                            <PenSquare className="mr-2 w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <Button
                            onClick={() =>
                              navigate(`items/${transactionItem.id}/delete`)
                            }
                            variant="outline"
                            size="sm"
                            disabled={!transactionItem.editable}
                            className="border-red-600/50 text-red-600"
                          >
                            <Trash2 className="mr-2 w-3.5 h-3.5" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
            <div className="mt-6 border bg-foreground/5 rounded-md mb-2 px-4 py-2 flex items-center justify-between">
              <h3 className="uppercase text-lg font-bold">Deductions</h3>
              {!payrollTransaction.isLocked && (
                <Link
                  to="items/new-deduction"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Add Deduction
                </Link>
              )}
            </div>
            <ul className="space-y-2">
              {payrollTransaction.transactionItems
                .filter(
                  (transactionItem) => transactionItem.type === "DEDUCTION"
                )
                .map((transactionItem) => (
                  <li
                    key={transactionItem.id}
                    className="border rounded-lg py-2 px-4 flex justify-between items-center"
                  >
                    <p className="font-semibold">{transactionItem.note}</p>
                    <div className="flex gap-6 items-center">
                      <p className="w-32 text-right"></p>
                      <span className="w-6"></span>
                      <p className="w-32 text-right">
                        {transactionItem.type === "DEDUCTION" &&
                          currencyFormatter("IDR", transactionItem.amount)}
                      </p>
                      {payrollTransaction.isLocked ? (
                        <div className="w-[185px]" />
                      ) : (
                        <div className="ml-6 gap-2 flex items-center">
                          <Button
                            onClick={() =>
                              navigate(`items/${transactionItem.id}/edit`)
                            }
                            variant="outline"
                            size="sm"
                            disabled={!transactionItem.editable}
                          >
                            <PenSquare className="mr-2 w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <Button
                            onClick={() =>
                              navigate(`items/${transactionItem.id}/delete`)
                            }
                            variant="outline"
                            size="sm"
                            disabled={!transactionItem.editable}
                            className="border-red-600/50 text-red-600"
                          >
                            <Trash2 className="mr-2 w-3.5 h-3.5" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
            <div className="mt-6 border bg-foreground/5 rounded-md mb-2 px-4 py-2 flex items-center justify-between">
              <h3 className="uppercase text-lg font-bold">Total</h3>
              <div className="flex gap-6 items-center">
                <p className="w-32 text-right">
                  {currencyFormatter(
                    "IDR",
                    payrollTransaction.transactionItems
                      .filter((item) => item.type === "WAGE")
                      .reduce((acc, curr) => acc + curr.amount, 0)
                  )}
                </p>
                <span className="w-6 text-center">-</span>
                <p className="w-32 text-right">
                  {currencyFormatter(
                    "IDR",
                    payrollTransaction.transactionItems
                      .filter((item) => item.type === "DEDUCTION")
                      .reduce((acc, curr) => acc + curr.amount, 0)
                  )}
                </p>
                <span className="w-10 text-center">=</span>
                <p className="text-right font-bold">
                  {currencyFormatter("IDR", payrollTransaction.total)}
                </p>
              </div>
            </div>

            {!payrollTransaction.isLocked && (
              <div className="mt-6 flex justify-between items-center">
                <Link
                  to="reset"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "text-lg"
                  )}
                >
                  <RotateCcw className="w-6 h-6 mr-2" />
                  Reset Payroll Transaction
                </Link>
                <Link
                  to="lock"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "text-lg text-green-600 border-green-600/40 hover:bg-green-600/10 hover:text-green-600"
                  )}
                >
                  <Lock className="w-6 h-6 mr-2" />
                  Lock Payroll Transaction
                </Link>
              </div>
            )}
          </div>
        )}
      </MainContainer>
    </>
  );
}

import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";

import MainContainer from "~/components/main-container";
import { requirePermission } from "~/utils/auth.server";
import { getPayrolls } from "~/services/payroll.server";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { currencyFormatter } from "~/utils/currency";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:payroll");
  const payrolls = await getPayrolls();

  return json({ payrolls });
}

export const monthName: Record<number, string> = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

export default function Payroll() {
  const { payrolls } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
          <Link to="new" className={buttonVariants({ variant: "outline" })}>
            Create New Payroll
          </Link>
        </div>
        {payrolls.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {payrolls.map((payroll) => (
              <Link
                key={payroll.id}
                to={payroll.id}
                className="border rounded-lg p-4 relative w-52 hover:bg-accent transition"
              >
                <p className="bg-foreground text-background px-2 rounded text-sm font-bold text-center">
                  {payroll.code}
                </p>
                <h3
                  className={cn(
                    "mt-4 font-bold text-sm text-center",
                    payroll.type === "MONTHLY_SALARY"
                      ? "text-green-600"
                      : "text-indigo-600"
                  )}
                >
                  {payroll.type === "MONTHLY_SALARY" ? "MONTHLY SALARY" : "THR"}
                </h3>
                <p className="text-2xl font-bold text-center">
                  {monthName[payroll.month]} {payroll.year}
                </p>
                <dl className="mt-6">
                  <div className="flex flex-col items-center">
                    <dt className="text-sm text-muted-foreground">
                      Transaction
                    </dt>
                    <dd className="text-2xl font-semibold">
                      {payroll.transactions.length}
                    </dd>
                  </div>
                  <div className="mt-4 flex flex-col items-center">
                    <dt className="text-sm text-muted-foreground">Total</dt>
                    <dd className="text-2xl font-semibold">
                      {currencyFormatter(
                        "IDR",
                        payroll.transactions.reduce(
                          (acc, curr) => acc + curr.total,
                          0
                        )
                      )}
                    </dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
        ) : (
          <div className="h-60 border-2 rounded-xl border-dashed flex flex-col items-center justify-center">
            <p className="text-muted-foreground">No payrolls</p>
          </div>
        )}
      </MainContainer>
    </>
  );
}

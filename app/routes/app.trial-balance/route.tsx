import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import MainContainer from "~/components/main-container";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { requirePermission } from "~/utils/auth.server";
import { currencyFormatter } from "~/utils/currency";
import { getTrialBalance } from "~/services/chart-of-account.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:finance");

  const trialBalance = await getTrialBalance();

  return json({ trialBalance });
}

export default function TrialBalance() {
  const { trialBalance } = useLoaderData<typeof loader>();

  const totalDebitTrialBalance = trialBalance.reduce((acc, curr) => {
    if (curr.normalBalance === "DEBIT") {
      return acc + curr.totalBalance;
    }
    return acc;
  }, 0);

  const totalCreditTrialBalance = trialBalance.reduce((acc, curr) => {
    if (curr.normalBalance === "DEBIT") {
      return acc + curr.totalBalance;
    }
    return acc;
  }, 0);

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Trial Balance</h1>
        </div>

        <div className="mt-4 border rounded">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Accounts</TableHead>
                <TableHead className="text-right px-4">Debit</TableHead>
                <TableHead className="text-right px-4">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trialBalance.map((balance) => (
                <TableRow key={balance.accountId}>
                  <TableCell className="px-4">
                    {balance.accountName}{" "}
                    <span className="text-muted-foreground">
                      ({balance.accountCategory})
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-4">
                    {balance.normalBalance === "DEBIT"
                      ? balance.totalBalance > 0
                        ? currencyFormatter("IDR", balance.totalBalance)
                        : `( ${currencyFormatter(
                            "IDR",
                            balance.totalBalance
                          )} )`
                      : null}
                  </TableCell>
                  <TableCell className="text-right px-4">
                    {balance.normalBalance === "CREDIT"
                      ? balance.totalBalance > 0
                        ? currencyFormatter("IDR", balance.totalBalance)
                        : `( ${currencyFormatter(
                            "IDR",
                            balance.totalBalance
                          )} )`
                      : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="px-4">Totals</TableCell>
                <TableCell className="px-4 text-right">
                  {currencyFormatter("IDR", totalDebitTrialBalance)}
                </TableCell>
                <TableCell className="px-4 text-right">
                  {currencyFormatter("IDR", totalCreditTrialBalance)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </MainContainer>
    </>
  );
}

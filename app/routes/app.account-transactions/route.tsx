import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData, useSearchParams } from "@remix-run/react";

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
import {
  getAccountWithTransactions,
  getChartOfAccounts,
} from "~/services/chart-of-account.server";
import { AccountComboBox } from "~/components/comboboxes/account-combobox";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:finance");

  const url = new URL(request.url);

  const accountId = url.searchParams.get("accountId");

  const chartOfAccounts = await getChartOfAccounts();

  if (!accountId) {
    return json({ account: null, chartOfAccounts });
  }

  const account = await getAccountWithTransactions({ accountId });

  return json({ account, chartOfAccounts });
}

export default function AccountTransactions() {
  const { account, chartOfAccounts } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedAccountId = searchParams.get("accountId");

  const handleSelectAccount = (accountId: string) => {
    setSearchParams((params) => {
      params.set("accountId", accountId);
      return params;
    });
  };

  const totalAmount =
    account?.journalEntryLines.reduce((acc, curr) => {
      if (
        (account.normalBalance === "DEBIT" && curr.type === "DEBIT") ||
        (account.normalBalance === "CREDIT" && curr.type === "CREDIT")
      ) {
        return acc + Number(curr.amount);
      }
      return acc - Number(curr.amount);
    }, 0) || 0;

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Account Transactions
          </h1>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <AccountComboBox
              name="accountId"
              accounts={chartOfAccounts}
              onSelectionChange={(key) => {
                if (key) {
                  handleSelectAccount(key.toString());
                }
              }}
              defaultValue={selectedAccountId || undefined}
              className="w-[400px]"
            />
          </div>

          {account ? (
            <div className="flex items-center gap-2">
              <dl className="border py-2 px-4 rounded-lg">
                <dt className="text-sm font-semibold text-muted-foreground">
                  Normal Balance
                </dt>
                <dd className="text-lg font-semibold">
                  {account.normalBalance}
                </dd>
              </dl>
              <dl className="border py-2 px-4 rounded-lg">
                <dt className="text-sm font-semibold text-muted-foreground">
                  Opening Balance
                </dt>
                <dd className="text-lg font-semibold">
                  {currencyFormatter("IDR", account?.openingBalance)}
                </dd>
              </dl>
            </div>
          ) : null}
        </div>

        {account ? (
          <div className="mt-4 border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Date</TableHead>
                  <TableHead className="px-4">Description</TableHead>
                  <TableHead className="px-4">Type</TableHead>
                  <TableHead className="text-right px-4">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {account.journalEntryLines.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="px-4">
                      {new Date(entry.journalEntry.date).toLocaleDateString(
                        "id-ID",
                        { dateStyle: "long" }
                      )}
                    </TableCell>
                    <TableCell className="px-4">
                      {entry.journalEntry.description}
                    </TableCell>
                    <TableCell className="px-4">{entry.type}</TableCell>
                    <TableCell className="text-right px-4">
                      {(account.normalBalance === "DEBIT" &&
                        entry.type === "DEBIT") ||
                      (account.normalBalance === "CREDIT" &&
                        entry.type === "CREDIT")
                        ? currencyFormatter("IDR", BigInt(entry.amount))
                        : `( ${currencyFormatter(
                            "IDR",
                            BigInt(entry.amount)
                          )} )`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="px-4">Total</TableCell>
                  <TableCell className="px-4 text-right">
                    {totalAmount < 0
                      ? `( ${currencyFormatter("IDR", -totalAmount)} )`
                      : currencyFormatter("IDR", totalAmount)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        ) : null}

        {account ? (
          <div className="flex justify-end mt-6">
            <dl className="border py-2 px-4 rounded-lg">
              <dt className="text-sm font-semibold text-muted-foreground">
                Current Balance
              </dt>
              <dd className="text-lg font-semibold">
                {currencyFormatter("IDR", account.openingBalance + totalAmount)}
              </dd>
            </dl>
          </div>
        ) : null}
      </MainContainer>
    </>
  );
}

import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import MainContainer from "~/components/main-container";
import { requirePermission } from "~/utils/auth.server";
import { currencyFormatter } from "~/utils/currency";
import { getFinanceDashboardData } from "~/services/chart-of-account.server";
import { TrendingDown, TrendingUp } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:finance");

  const dashboardData = await getFinanceDashboardData();

  return json({ dashboardData });
}

export default function FinanceDashboard() {
  const { dashboardData } = useLoaderData<typeof loader>();

  // const totalDebitTrialBalance = trialBalance.reduce((acc, curr) => {
  //   if (curr.normalBalance === "DEBIT") {
  //     return acc + curr.totalBalance;
  //   }
  //   return acc;
  // }, 0);

  // const totalCreditTrialBalance = trialBalance.reduce((acc, curr) => {
  //   if (curr.normalBalance === "DEBIT") {
  //     return acc + curr.totalBalance;
  //   }
  //   return acc;
  // }, 0);

  console.log({ dashboardData });

  const totalAssets = dashboardData["Assets"].reduce(
    (acc, curr) => acc + curr.totalBalance,
    0
  );
  const totalOpeningBalanceAssets = dashboardData["Assets"].reduce(
    (acc, curr) => acc + curr.openingBalance,
    0
  );
  const percentChangesAssets =
    ((totalAssets - totalOpeningBalanceAssets) / totalAssets) * 100;

  const totalLiabilities = dashboardData["Liabilities"].reduce(
    (acc, curr) => acc + curr.totalBalance,
    0
  );
  const totalOpeningBalanceLiabilities = dashboardData["Liabilities"].reduce(
    (acc, curr) => acc + curr.openingBalance,
    0
  );
  const percentChangesLiabilities =
    ((totalLiabilities - totalOpeningBalanceLiabilities) / totalLiabilities) *
    100;

  const totalEquity = dashboardData["Equity"].reduce(
    (acc, curr) => acc + curr.totalBalance,
    0
  );
  const totalOpeningBalanceEquity = dashboardData["Equity"].reduce(
    (acc, curr) => acc + curr.openingBalance,
    0
  );
  const percentChangesEquity =
    ((totalEquity - totalOpeningBalanceEquity) / totalEquity) * 100;

  const totalRevenue = dashboardData["Revenue"].reduce(
    (acc, curr) => acc + curr.totalBalance,
    0
  );

  const totalExpenses = dashboardData["Expenses"].reduce(
    (acc, curr) => acc + curr.totalBalance,
    0
  );

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border pt-6 pb-7 px-8 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl text-muted-foreground">Assets</h2>
                {percentChangesAssets > 0 ? (
                  <p className="text-green-600 text-lg flex items-center font-semibold">
                    <TrendingUp className="w-6 h-6 mr-2" />+
                    {percentChangesAssets.toFixed(1)}%
                  </p>
                ) : percentChangesAssets < 0 ? (
                  <p className="text-red-600 text-lg flex items-center font-semibold">
                    <TrendingDown className="w-6 h-6 mr-2" />
                    {percentChangesAssets.toFixed(1)}%
                  </p>
                ) : null}
              </div>
              <p className="text-4xl font-medium">
                {currencyFormatter("IDR", totalAssets)}
              </p>
            </div>
            <div className="border pt-6 pb-7 px-8 rounded-lg">
              <h2 className="text-xl text-muted-foreground mb-2">Expenses</h2>
              <p className="text-4xl font-medium">
                {currencyFormatter("IDR", totalExpenses)}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="border pt-6 pb-7 px-8 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl text-muted-foreground">Liabilities</h2>
                {percentChangesLiabilities > 0 ? (
                  <p className="text-green-600 text-lg flex items-center font-semibold">
                    <TrendingUp className="w-6 h-6 mr-2" />+
                    {percentChangesLiabilities.toFixed(1)}%
                  </p>
                ) : percentChangesLiabilities < 0 ? (
                  <p className="text-red-600 text-lg flex items-center font-semibold">
                    <TrendingDown className="w-6 h-6 mr-2" />
                    {percentChangesLiabilities.toFixed(1)}%
                  </p>
                ) : null}
              </div>
              <p className="text-4xl font-medium">
                {currencyFormatter("IDR", totalLiabilities)}
              </p>
            </div>
            <div className="border pt-6 pb-7 px-8 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl text-muted-foreground">Equity</h2>
                {percentChangesEquity > 0 ? (
                  <p className="text-green-600 text-lg flex items-center font-semibold">
                    <TrendingUp className="w-6 h-6 mr-2" /> +
                    {percentChangesEquity.toFixed(1)}%
                  </p>
                ) : percentChangesEquity < 0 ? (
                  <p className="text-red-600 text-lg flex items-center font-semibold">
                    <TrendingDown className="w-6 h-6 mr-2" />{" "}
                    {percentChangesEquity.toFixed(1)}%
                  </p>
                ) : null}
              </div>
              <p className="text-4xl font-medium">
                {currencyFormatter("IDR", totalEquity)}
              </p>
            </div>
            <div className="border pt-6 pb-7 px-8 rounded-lg">
              <h2 className="text-xl text-muted-foreground mb-2">Revenue</h2>
              <p className="text-4xl font-medium">
                {currencyFormatter("IDR", totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </MainContainer>
    </>
  );
}

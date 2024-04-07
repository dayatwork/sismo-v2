import MainContainer from "~/components/main-container";
import balanceSheet from "./assets/balance-sheet.png";
import incomeStatement from "./assets/income-statement.png";
import cashFlowStatement from "./assets/cash-flow-statement.png";
import { Link } from "@remix-run/react";

export default function FinancialStatement() {
  return (
    <MainContainer>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Financial Statement
        </h1>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-6">
        <Link
          to="income-statement"
          className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-foreground text-background hover:scale-105 transition"
        >
          <img src={incomeStatement} alt="Income statement" />
          <h2 className="text-xl font-bold">Income Statement</h2>
        </Link>
        <Link
          to="balance-sheet"
          className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-foreground text-background hover:scale-105 transition"
        >
          <img src={balanceSheet} alt="Balance sheet" />
          <h2 className="text-xl font-bold">Balance Sheet</h2>
        </Link>
        <Link
          to="cash-flow-statement"
          className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-foreground text-background hover:scale-105 transition"
        >
          <img src={cashFlowStatement} alt="Cash flow statement" />
          <h2 className="text-xl font-bold">Cash Flow Statement</h2>
        </Link>
      </div>
    </MainContainer>
  );
}

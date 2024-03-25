import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import {
  Check,
  MoreVerticalIcon,
  // PenSquareIcon,
  Trash2Icon,
  X,
} from "lucide-react";
import MainContainer from "~/components/main-container";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getExpenses } from "~/services/expense.server";
import { requirePermission } from "~/utils/auth.server";
import { currencyFormatter } from "~/utils/currency";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  await requirePermission(request, "manage:finance");

  const expenses = await getExpenses();

  return json({ expenses });
}

export default function Expenses() {
  const { expenses } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <Button asChild>
            <Link to="new">Submit New Expense</Link>
          </Button>
        </div>

        <div className="mt-4 border rounded-md bg-neutral-50 dark:bg-neutral-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Code</TableHead>
                <TableHead>Chart of Account</TableHead>
                <TableHead className="w-36 text-right">Unit Price</TableHead>
                <TableHead className="w-24 text-right">Quantity</TableHead>
                <TableHead className="w-36 text-right">Amount</TableHead>
                <TableHead className="w-36 text-right">
                  <span className="pr-3">Status</span>
                </TableHead>
                <TableHead className="w-20">
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-muted-foreground text-center"
                  >
                    No expenses
                  </TableCell>
                </TableRow>
              )}
              {expenses.map((expense) => (
                <TableRow key={expense.id} className="group">
                  <TableCell className="pl-6">{expense.code}</TableCell>
                  <TableCell>
                    {expense.chartOfAccount
                      ? `${expense.chartOfAccount.code} - ${expense.chartOfAccount.type} - ${expense.chartOfAccount.accountName}`
                      : "-"}
                  </TableCell>
                  <TableCell className="w-36 text-right">
                    {currencyFormatter(
                      expense.currency,
                      BigInt(expense.unitPrice || "0")
                    )}
                  </TableCell>
                  <TableCell className="w-24 text-right">
                    {expense.quantity}
                  </TableCell>
                  <TableCell className="w-36 text-right">
                    {currencyFormatter(
                      expense.currency,
                      BigInt(expense.amount || "0")
                    )}
                  </TableCell>
                  <TableCell className="w-36 text-right">
                    <Badge
                      variant={
                        expense.status === "APPROVED"
                          ? "green"
                          : expense.status === "REJECTED"
                          ? "red"
                          : "blue"
                      }
                    >
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end w-20">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-9 w-9 flex items-center justify-center border border-transparent hover:border-border rounded">
                        <span className="sr-only">Open</span>
                        <MoreVerticalIcon className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Action</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          asChild
                          disabled={expense.status !== "SUBMITTED"}
                        >
                          <Link
                            to={`${expense.id}/approve`}
                            className="cursor-pointer"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            <span className="pr-2 font-semibold">Approve</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          disabled={expense.status !== "SUBMITTED"}
                        >
                          <Link
                            to={`${expense.id}/reject`}
                            className="cursor-pointer"
                          >
                            <X className="w-4 h-4 mr-2" />
                            <span className="pr-2 font-semibold">Reject</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {/* <DropdownMenuItem asChild>
                          <Link
                            to={`${expense.id}/edit`}
                            className="cursor-pointer"
                          >
                            <PenSquareIcon className="w-4 h-4 mr-2" />
                            <span className="pr-2 font-semibold">Edit</span>
                          </Link>
                        </DropdownMenuItem> */}
                        <DropdownMenuItem className="text-red-600" asChild>
                          <Link
                            to={`${expense.id}/delete`}
                            className="cursor-pointer"
                          >
                            <Trash2Icon className="w-4 h-4 mr-2" />
                            <span className="pr-2 font-semibold">Delete</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MainContainer>
    </>
  );
}

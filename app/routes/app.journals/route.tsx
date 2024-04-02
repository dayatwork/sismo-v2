import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { MoreVerticalIcon, Trash2Icon } from "lucide-react";

import MainContainer from "~/components/main-container";
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
import { requirePermission } from "~/utils/auth.server";
import { currencyFormatter } from "~/utils/currency";
import { getJournals } from "~/services/journal.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:finance");

  const journals = await getJournals();

  return json({ journals });
}

export default function Journals() {
  const { journals } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
          <Button asChild>
            <Link to="new">Add New Entry</Link>
          </Button>
        </div>

        <div className="mt-4 border rounded-md bg-neutral-50 dark:bg-neutral-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Date</TableHead>
                <TableHead>Reference Number</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Debit</TableHead>
                <TableHead>Credit</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-20">
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {journals.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-muted-foreground text-center"
                  >
                    No entries
                  </TableCell>
                </TableRow>
              )}
              {journals.map((journal) => (
                <TableRow key={journal.id} className="group">
                  <TableCell className="pl-6 w-36">
                    {new Date(journal.date).toLocaleString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{journal.referenceNumber}</TableCell>
                  <TableCell>{journal.chartOfAccount.code}</TableCell>
                  <TableCell>{journal.chartOfAccount.accountName}</TableCell>
                  <TableCell>
                    {journal.chartOfAccount.normalBalance === "DEBIT" &&
                      `${currencyFormatter(
                        journal.currency,
                        BigInt(journal.amount || "0")
                      )}`}
                  </TableCell>
                  <TableCell>
                    {journal.chartOfAccount.normalBalance === "CREDIT" &&
                      `${currencyFormatter(
                        journal.currency,
                        BigInt(journal.amount || "0")
                      )}`}
                  </TableCell>
                  <TableCell>{journal.description}</TableCell>
                  <TableCell className="flex justify-end w-20">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-9 w-9 flex items-center justify-center border border-transparent hover:border-border rounded">
                        <span className="sr-only">Open</span>
                        <MoreVerticalIcon className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Action</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="text-red-600" asChild>
                          <Link
                            to={`${journal.id}/delete`}
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

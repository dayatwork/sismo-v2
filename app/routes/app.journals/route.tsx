import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

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
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { requirePermission } from "~/utils/auth.server";
import { currencyFormatter } from "~/utils/currency";
import { getJournalEntries } from "~/services/journal.server";
import { MoreVerticalIcon, PenSquareIcon, Trash2Icon } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:finance");

  const journalEntries = await getJournalEntries();

  return json({ journalEntries });
}

export default function JournalEntries() {
  const { journalEntries } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Journal Entries</h1>
          <Button asChild>
            <Link to="new">Add New Entry</Link>
          </Button>
        </div>

        <ul className="mt-6 space-y-4">
          {journalEntries.map((journalEntry) => (
            <li key={journalEntry.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Journal Number : JE-
                  {journalEntry.entryNumber.toString().padStart(5, "0")}
                </h3>
                <div className="flex items-center gap-6">
                  <p className="text-sm text-muted-foreground">
                    Reference Number : {journalEntry.referenceNumber || "-"}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <span className="sr-only">Open</span>
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Action</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link
                          to={`${journalEntry.id}/edit`}
                          className="cursor-pointer"
                        >
                          <PenSquareIcon className="w-4 h-4 mr-2" />
                          <span className="pr-2 font-semibold">Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" asChild>
                        <Link
                          to={`${journalEntry.id}/delete`}
                          className="cursor-pointer"
                        >
                          <Trash2Icon className="w-4 h-4 mr-2" />
                          <span className="pr-2 font-semibold">Delete</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <Table className="mt-4">
                <TableCaption className="text-left">
                  Description : {journalEntry.description}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Date</TableHead>
                    <TableHead className="px-6">Account</TableHead>
                    <TableHead className="px-6 text-right">Debit</TableHead>
                    <TableHead className="px-6 text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journalEntry.entryLines
                    .sort((a, b) => {
                      if (a.type === "DEBIT" && b.type === "CREDIT") {
                        return -1;
                      } else if (a.type === "CREDIT" && b.type === "DEBIT") {
                        return 1;
                      } else {
                        return 0;
                      }
                    })
                    .map((line, index) => (
                      <TableRow key={line.id}>
                        <TableCell className="px-6">
                          {index === 0 &&
                            new Date(journalEntry.date).toLocaleDateString(
                              "id-ID",
                              { dateStyle: "long" }
                            )}
                        </TableCell>
                        <TableCell
                          className={
                            line.type === "CREDIT" ? "pl-20 pr-6" : "pl-6 pr-6"
                          }
                        >
                          {line.account.accountName}
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          {line.type === "DEBIT" &&
                            currencyFormatter(
                              line.currency,
                              BigInt(line.amount)
                            )}
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          {line.type === "CREDIT" &&
                            currencyFormatter(
                              line.currency,
                              BigInt(line.amount)
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell className="px-6">Total</TableCell>
                    <TableCell className="px-6 text-right">
                      {currencyFormatter(
                        "IDR",
                        journalEntry.entryLines.reduce((acc, curr) => {
                          if (curr.type === "DEBIT") {
                            return acc + Number(curr.amount);
                          }
                          return acc;
                        }, 0)
                      )}
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      {currencyFormatter(
                        "IDR",
                        journalEntry.entryLines.reduce((acc, curr) => {
                          if (curr.type === "DEBIT") {
                            return acc + Number(curr.amount);
                          }
                          return acc;
                        }, 0)
                      )}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </li>
          ))}
        </ul>
      </MainContainer>
    </>
  );
}

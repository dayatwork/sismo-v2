import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { MoreVerticalIcon, PenSquareIcon, Trash2Icon } from "lucide-react";

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
import { getChartOfAccounts } from "~/services/chart-of-account.server";
import { requirePermission } from "~/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:finance");

  const chartOfAccounts = await getChartOfAccounts();

  return json({ chartOfAccounts });
}

export default function ChartOfAccounts() {
  const { chartOfAccounts } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
        <Button asChild>
          <Link to="new">Create New COA</Link>
        </Button>
      </div>

      <div className="mt-4 border rounded-md bg-neutral-50 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[200px]">Class</TableHead>
              <TableHead className="px-6">Type</TableHead>
              <TableHead className="px-6">Code</TableHead>
              <TableHead className="whitespace-nowrap px-6">
                Account Name
              </TableHead>
              <TableHead className="whitespace-nowrap px-6">
                Normal Balance
              </TableHead>
              <TableHead className="px-6">Description</TableHead>
              <TableHead>
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartOfAccounts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-muted-foreground text-center"
                >
                  No chart of accounts
                </TableCell>
              </TableRow>
            )}
            {chartOfAccounts.map((coa) => (
              <TableRow key={coa.id} className="group">
                <TableCell className="px-6 w-[200px] whitespace-nowrap">
                  {coa.type.class.name}
                </TableCell>
                <TableCell className="whitespace-nowrap px-6">
                  {coa.type.name}
                </TableCell>
                <TableCell className="whitespace-nowrap px-6">
                  {coa.code}
                </TableCell>
                <TableCell className="whitespace-nowrap px-6">
                  {coa.accountName}
                </TableCell>
                <TableCell className="px-6">{coa.normalBalance}</TableCell>
                <TableCell className="px-6">{coa.description}</TableCell>
                <TableCell className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-9 w-9 flex items-center justify-center border border-transparent hover:border-border rounded">
                      <span className="sr-only">Open</span>
                      <MoreVerticalIcon className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Action</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={`${coa.id}/edit`} className="cursor-pointer">
                          <PenSquareIcon className="w-4 h-4 mr-2" />
                          <span className="pr-2 font-semibold">Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" asChild>
                        <Link
                          to={`${coa.id}/delete`}
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
    </>
  );
}

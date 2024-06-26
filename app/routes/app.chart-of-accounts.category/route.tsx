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
import { getCoaCategories } from "~/services/chart-of-account.server";
import { requirePermission } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:finance");

  const coaCategories = await getCoaCategories();

  return json({ coaCategories });
}

export default function ChartOfAccountCategories() {
  const { coaCategories } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Account Categories
        </h1>
        <Button asChild>
          <Link to="new">Create New Category</Link>
        </Button>
      </div>

      <div className="mt-4 border rounded-md bg-neutral-50 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 whitespace-nowrap">
                Category Name
              </TableHead>
              <TableHead className="pl-6 whitespace-nowrap">
                Normal Balance
              </TableHead>
              <TableHead>
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaCategories.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-10 text-muted-foreground text-center"
                >
                  No chart of account categories
                </TableCell>
              </TableRow>
            )}
            {coaCategories.map((category) => (
              <TableRow key={category.id} className="group">
                <TableCell className="px-6 whitespace-nowrap">
                  {category.name}
                </TableCell>
                <TableCell className="px-6 whitespace-nowrap">
                  {category.normalBalance}
                </TableCell>

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
                        <Link
                          to={`${category.id}/edit`}
                          className="cursor-pointer"
                        >
                          <PenSquareIcon className="w-4 h-4 mr-2" />
                          <span className="pr-2 font-semibold">Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" asChild>
                        <Link
                          to={`${category.id}/delete`}
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

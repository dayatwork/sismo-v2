import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { PenSquareIcon, Trash2Icon } from "lucide-react";

import { Button, buttonVariants } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { getJobLevels } from "~/services/job-level.server";
import { requirePermission } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:organization");
  const jobLevels = await getJobLevels();

  return json({ jobLevels });
}

export default function OrganizationJobLevel() {
  const { jobLevels } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <div className="mb-3 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Job Levels</h1>
        {/* <ProtectComponent permission="manage:organization"> */}
        <Link to="new" className={cn(buttonVariants())}>
          + Add New Job Level
        </Link>
        {/* </ProtectComponent> */}
      </div>
      <div className="rounded-md border bg-neutral-50 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobLevels.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-center py-10 text-muted-foreground"
                  colSpan={2}
                >
                  No Data
                </TableCell>
              </TableRow>
            )}
            {jobLevels.map((jobLevel) => (
              <TableRow key={jobLevel.id} className="group">
                <TableCell className="pl-6 font-semibold">
                  {jobLevel.name}
                </TableCell>
                <TableCell className="pr-6 flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                  {/* <ProtectComponent permission="manage:organization"> */}
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`${jobLevel.id}/edit`} className="cursor-pointer">
                      <PenSquareIcon className="w-4 h-4 mr-2" />
                      <span className="pr-2 font-semibold">Edit</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    asChild
                  >
                    <Link
                      to={`${jobLevel.id}/delete`}
                      className="cursor-pointer"
                    >
                      <Trash2Icon className="w-4 h-4 mr-2" />
                      <span className="pr-2 font-semibold">Delete</span>
                    </Link>
                  </Button>

                  {/* </ProtectComponent> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { PenSquare, PenSquareIcon, Trash2Icon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { authenticator } from "~/services/auth.server";
import { getDirectorates } from "~/services/directorate.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });

  const directorates = await getDirectorates(organizationId);

  return json({ directorates });
}

export default function OrganizationDirectorate() {
  const { directorates } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <div className="mb-3 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Directorates</h1>
        {/* <ProtectComponent permission="manage:organization"> */}
        <Link to="new-directorate" className={cn(buttonVariants())}>
          + Add New Directorate
        </Link>
        {/* </ProtectComponent> */}
      </div>
      <div className="rounded-md border bg-neutral-50 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Divisions</TableHead>
              <TableHead>
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {directorates.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-center py-10 text-muted-foreground"
                  colSpan={3}
                >
                  No Data
                </TableCell>
              </TableRow>
            )}
            {directorates.map((directorate) => (
              <TableRow key={directorate.id} className="group">
                <TableCell className="pl-6 font-semibold">
                  {directorate.name}
                </TableCell>
                <TableCell>
                  {directorate.divisions.length
                    ? directorate.divisions.map((division) => (
                        <Popover key={division.id}>
                          <PopoverTrigger>
                            <Badge
                              variant="outline"
                              className="mr-2 h-9 rounded-sm text-primary text-base font-semibold"
                            >
                              {division.name}
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-2">
                            <p className="font-semibold mb-2 text-center">
                              Division {division.name}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <Button asChild variant="outline">
                                <Link to={`division/${division.id}/edit`}>
                                  <PenSquare className="w-4 h-4 mr-2" />
                                  Edit
                                </Link>
                              </Button>
                              <Button
                                asChild
                                variant="outline"
                                className="text-red-600"
                              >
                                <Link to={`division/${division.id}/delete`}>
                                  <Trash2Icon className="w-4 h-4 mr-2" />
                                  Delete
                                </Link>
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ))
                    : null}

                  {/* <ProtectComponent permission="manage:organization"> */}
                  <Link
                    to={`${directorate.id}/new-division`}
                    className={cn(
                      buttonVariants({
                        variant: "outline",
                        size: "sm",
                      }),
                      "border-dashed border-slate-300 text-base h-9"
                    )}
                  >
                    + Division
                  </Link>
                  {/* </ProtectComponent> */}
                </TableCell>
                <TableCell className="pr-6 flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`${directorate.id}/edit`}
                      className="cursor-pointer"
                    >
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
                      to={`${directorate.id}/delete`}
                      className="cursor-pointer"
                    >
                      <Trash2Icon className="w-4 h-4 mr-2" />
                      <span className="pr-2 font-semibold">Delete</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

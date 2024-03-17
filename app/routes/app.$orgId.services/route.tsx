import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { MoreVerticalIcon, PenSquareIcon, Trash2Icon } from "lucide-react";
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
import { getServices } from "~/services/service.server";
import { requirePermission } from "~/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:service"
  );

  if (!loggedInUser) {
    return redirect(`/app/${organizationId}`);
  }

  const services = await getServices({ organizationId });

  return json({ services });
}

export default function Services() {
  const { services } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <Button asChild>
            <Link to="new">Create New Service</Link>
          </Button>
        </div>

        <div className="mt-4 border rounded-md bg-neutral-50 dark:bg-neutral-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 w-[200px]">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-10 text-muted-foreground text-center"
                  >
                    No services
                  </TableCell>
                </TableRow>
              )}
              {services.map((service) => (
                <TableRow key={service.id} className="group">
                  <TableCell className="pl-6 w-[200px]">
                    {service.code}
                  </TableCell>
                  <TableCell>{service.name}</TableCell>
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
                            to={`${service.id}/edit`}
                            className="cursor-pointer"
                          >
                            <PenSquareIcon className="w-4 h-4 mr-2" />
                            <span className="pr-2 font-semibold">Edit</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" asChild>
                          <Link
                            to={`${service.id}/delete`}
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

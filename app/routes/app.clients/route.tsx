import { Link, Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import { type LoaderFunctionArgs, json } from "@remix-run/node";

import MainContainer from "~/components/main-container";
import { Input } from "~/components/ui/input";
import { buttonVariants } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreVerticalIcon, PenSquareIcon, Trash2Icon } from "lucide-react";
import { requirePermission } from "~/utils/auth.server";
import { getClients } from "~/services/client.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:client");

  const clients = await getClients();

  return json({ clients });
}

export default function Clients() {
  const { clients } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const clientName = searchParams.get("clientName");

  return (
    <MainContainer>
      <Outlet />
      <h1 className="text-2xl font-bold tracking-tight mb-6">Clients</h1>
      <div className="flex justify-between">
        <Input
          type="search"
          placeholder="Search by name..."
          className="max-w-[300px]"
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              setSearchParams({ clientName: e.currentTarget.value });
            }
          }}
          defaultValue={clientName || ""}
        />
        <Link to="new" className={buttonVariants()}>
          + Add New Client
        </Link>
      </div>
      <div className="mt-2 rounded-md border bg-neutral-50 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[150px]">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-10 text-muted-foreground"
                >
                  No clients
                </TableCell>
              </TableRow>
            )}
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="pl-6 w-[150px]">{client.code}</TableCell>
                <TableCell>{client.name}</TableCell>
                {/* <TableCell>
                  <HoverCard>
                    <HoverCardTrigger>
                      {employee.positions.length} Positions
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <h3>Positions</h3>
                      <Separator className="my-2" />
                      {employee.positions.length === 0 && (
                        <p className="text-muted-foreground text-center py-2">
                          No positions
                        </p>
                      )}
                      <ul>
                        {employee.positions.map((position) => (
                          <li key={position.id}>
                            {position.jobLevel.name} - {position.division.name}{" "}
                            - {position.division.directorate.name}
                          </li>
                        ))}
                      </ul>
                    </HoverCardContent>
                  </HoverCard>
                </TableCell> */}

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
                          to={`${client.id}/edit`}
                          className="cursor-pointer"
                        >
                          <PenSquareIcon className="w-4 h-4 mr-2" />
                          <span className="pr-2 font-semibold">Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" asChild>
                        <Link
                          to={`${client.id}/delete`}
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
  );
}

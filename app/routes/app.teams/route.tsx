import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { FileText } from "lucide-react";

import MainContainer from "~/components/main-container";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { requirePermission } from "~/utils/auth.server";
import { cn } from "~/lib/utils";
import { getTeams } from "~/services/team.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:team");

  const teams = await getTeams();

  return json({ teams });
}

export default function Teams() {
  const { teams } = useLoaderData<typeof loader>();

  return (
    <MainContainer>
      <Outlet />
      <div className="mb-3 flex justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
        {/* <ProtectComponent permission="manage:organization"> */}
        <Link to="new" className={cn(buttonVariants())}>
          + Add New Team
        </Link>
        {/* </ProtectComponent> */}
      </div>
      <div className="rounded-md border bg-neutral-50 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[60px]">
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-center py-10 text-muted-foreground"
                  colSpan={5}
                >
                  No Data
                </TableCell>
              </TableRow>
            )}
            {teams.map((team) => (
              <TableRow key={team.id} className="group">
                <TableCell className="pl-5">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src={team.logo || ""}
                        alt={team.name}
                        className="object-cover"
                      />
                      <AvatarFallback>{team.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{team.name}</span>
                  </div>
                </TableCell>
                <TableCell>{team.description}</TableCell>
                <TableCell className="opacity-0 group-hover:opacity-100 pr-4">
                  {/* <ProtectComponent permission="manage:organization"> */}
                  <div className="flex justify-end items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`${team.id}`} className="cursor-pointer">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>Details</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MainContainer>
  );
}

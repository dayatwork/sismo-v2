import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { Building2, PlusIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import { useRef } from "react";

import MainContainer from "~/components/main-container";
import { SearchInput } from "~/components/search-input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { buttonVariants } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { getDepartmentById } from "~/services/department.server";
import { requirePermission } from "~/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:department"
  );

  if (!loggedInUser) {
    return redirect(`/app/${organizationId}`);
  }

  const departmentId = params.id;
  if (!departmentId) {
    return redirect(`/app/${organizationId}/departments`);
  }

  const department = await getDepartmentById({
    id: departmentId,
    organizationId,
  });
  if (!department) {
    return redirect(`/app/${organizationId}/departments`);
  }

  return json({ department });
}

export default function DepartmentDetails() {
  const { orgId } = useParams<{ orgId: string }>();
  const { department } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get("search") || undefined;
  const searchRef = useRef<HTMLInputElement | null>(null);

  const handleSearchForm = (search: string) => {
    setSearchParams((prev) => {
      if (search) {
        prev.set("search", search);
      } else {
        prev.delete("search");
      }
      // prev.set("page", "1");
      return prev;
    });
  };
  const handleClearSearchForm = () => {
    setSearchParams((prev) => {
      prev.delete("search");
      // prev.set("page", "1");
      return prev;
    });
    if (searchRef.current?.value) {
      searchRef.current!.value = "";
    }
  };

  return (
    <MainContainer>
      <Outlet
        context={{
          membersIds: department.departmentMembers.map((dm) => dm.userId),
        }}
      />
      {/* <Link
        to={`/app/${orgId}/departments`}
        className="hover:underline mb-4 block"
      >
        &larr; Back to departments
      </Link> */}
      <Breadcrumb>
        <BreadcrumbList className="mb-4">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/app/${orgId}/departments`}>Departments</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{department.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-3 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="rounded-xl border w-16 h-16 flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {department.name}
            </h1>
            <p className="text-muted-foreground">{department.description}</p>
          </div>
        </div>
        <Link
          to="edit"
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          <SquarePenIcon className="w-4 h-4 mr-2" />
          Edit
        </Link>
      </div>
      <Tabs defaultValue="members" className="mt-10">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          {department.departmentMembers.length === 0 && (
            <div className="h-40 flex flex-col gap-2 items-center justify-center">
              <p className="text-muted-foreground">No members</p>
              <Link
                to="add-member"
                className={buttonVariants({ variant: "outline" })}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add member
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 mb-2">
            <SearchInput
              key={searchText}
              onClear={handleClearSearchForm}
              onSearch={handleSearchForm}
              placeholder="Search by name"
              defaultValue={searchText}
            />
            <Link
              to="add-member"
              className={buttonVariants({ variant: "outline" })}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add member
            </Link>
          </div>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>
                    <span className="sr-only">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {department.departmentMembers.map((dm) => (
                  <TableRow key={dm.userId}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={dm.user.photo || ""} />
                          <AvatarFallback>{dm.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p>{dm.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {dm.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{dm.role}</TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end">
                        <Link
                          to={`remove-member/${dm.userId}`}
                          className="h-9 w-9 inline-flex justify-center items-center rounded-md border hover:bg-accent text-red-600"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="documents">Documents</TabsContent>
      </Tabs>
    </MainContainer>
  );
}

import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import {
  Boxes,
  MoreVerticalIcon,
  PenSquareIcon,
  Trash2Icon,
} from "lucide-react";
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
import { getProducts } from "~/services/product.server";
import { requirePermission } from "~/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:product"
  );

  if (!loggedInUser) {
    return redirect(`/app/${organizationId}`);
  }

  const products = await getProducts({ organizationId });

  return json({ products });
}

export default function Products() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <Button asChild>
            <Link to="new">Create New Product</Link>
          </Button>
        </div>

        <div className="mt-4 border rounded-md bg-neutral-50 dark:bg-neutral-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 w-[200px]">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subproducts</TableHead>
                <TableHead>
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-muted-foreground text-center"
                  >
                    No products
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => {
                const totalSubproducts = product.subProducts.length;

                return (
                  <TableRow key={product.id} className="group">
                    <TableCell className="pl-6 w-[200px]">
                      {product.code}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      {totalSubproducts}{" "}
                      {totalSubproducts === 1 ? "Subproduct" : "Subproducts"}
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
                              to={`${product.id}/subproducts`}
                              className="cursor-pointer"
                            >
                              <Boxes className="w-4 h-4 mr-2" />
                              <span className="pr-2 font-semibold">
                                Subproducts
                              </span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              to={`${product.id}/edit`}
                              className="cursor-pointer"
                            >
                              <PenSquareIcon className="w-4 h-4 mr-2" />
                              <span className="pr-2 font-semibold">Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" asChild>
                            <Link
                              to={`${product.id}/delete`}
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      </MainContainer>
    </>
  );
}

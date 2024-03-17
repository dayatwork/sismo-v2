import {
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";

import { Modal, Dialog, Heading } from "react-aria-components";

import { getSubProducts } from "~/services/product.server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { PenSquareIcon, Trash2Icon } from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const productId = params.id;
  if (!productId) {
    return redirect(`/app/${organizationId}/products`);
  }

  const products = await getSubProducts({
    organizationId,
    parentId: productId,
  });

  return json({ products });
}

export default function SubProducts() {
  const { products } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();

  return (
    <>
      <Modal
        isDismissable
        isOpen={true}
        onOpenChange={() => navigate(`/app/${orgId}/products`)}
        className="overflow-hidden w-full max-w-4xl"
      >
        <Dialog className="bg-background border rounded-md p-6 outline-none">
          <div className="flex items-center justify-between">
            <Heading slot="title" className="text-lg font-semibold">
              Subproducts
            </Heading>
            <Button asChild>
              <Link to="new">Create New Subproduct</Link>
            </Button>
          </div>

          <div className="mt-8 border rounded-md bg-neutral-50 dark:bg-neutral-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>
                    <span className="sr-only">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-6 text-muted-foreground text-center"
                    >
                      No subproducts
                    </TableCell>
                  </TableRow>
                )}
                {products.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell className="pl-4">{product.code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        className="opacity-0 group-hover:opacity-100"
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link to={`${product.id}/edit`}>
                          <PenSquareIcon className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        className="opacity-0 group-hover:opacity-100 text-red-600"
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link to={`${product.id}/delete`}>
                          <Trash2Icon className="w-4 h-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-8 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/${orgId}/products`)}
            >
              Close
            </Button>
          </div>
        </Dialog>
      </Modal>
      <Outlet />
    </>
  );
}

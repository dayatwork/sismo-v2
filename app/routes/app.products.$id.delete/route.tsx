import {
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  json,
  type ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Modal, Dialog, Heading } from "react-aria-components";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { redirectWithToast } from "~/utils/toast.server";
import { Input } from "~/components/ui/input";
import { requirePermission } from "~/utils/auth.server";
import { deleteProduct, getProductById } from "~/services/product.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const productId = params.id;
  if (!productId) {
    return redirect(`/app/products`);
  }

  await requirePermission(request, "manage:product");

  await deleteProduct({ productId });

  return redirectWithToast(`/app/products`, {
    description: `Product deleted`,
    type: "success",
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const productId = params.id;
  if (!productId) {
    return redirect(`/app/products`);
  }

  await requirePermission(request, "manage:product");

  const product = await getProductById({ productId });

  if (!product) {
    return redirect(`/app/products`);
  }

  return json({ product });
}

export default function DeleteProduct() {
  const { product } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Modal
      isDismissable
      isOpen={true}
      onOpenChange={() => navigate(`/app/products`)}
      className="overflow-hidden w-full max-w-md"
    >
      <Dialog className="bg-background border rounded-md p-6 outline-none">
        <Form method="post">
          <Heading slot="title" className="text-lg font-semibold">
            Delete Product
          </Heading>
          <p className="my-4">
            Are you sure to delete product "{product.name}"?
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <p className="mt-1 text-sm">
            type "<span className="font-semibold">{product.code}</span>" to
            confirm
          </p>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/products`)}
            >
              Cancel
            </Button>
            <Button
              disabled={product.code !== confirmText || submitting}
              variant="destructive"
              type="submit"
            >
              {submitting ? "Deleting" : "Delete"}
            </Button>
          </div>
        </Form>
      </Dialog>
    </Modal>
  );
}

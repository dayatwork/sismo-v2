import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";

import {
  deactivateOrganization,
  getOrganizationById,
} from "~/services/organization.server";
import { getUserById } from "~/services/user.server";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authenticator } from "~/services/auth.server";
import { redirectWithToast } from "~/utils/toast.server";
import { useState } from "react";

export async function action({ request, params }: ActionFunctionArgs) {
  const organizationId = params.id;
  if (!organizationId) {
    return redirect("/admin/organizations");
  }

  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await getUserById(id);

  if (!user) {
    return await authenticator.logout(request, { redirectTo: "/login" });
  }

  if (!user.isSuperAdmin) {
    return redirectWithToast("/app", {
      description: "Unauthorized!",
      type: "error",
    });
  }

  try {
    await deactivateOrganization(organizationId);
    return redirectWithToast("/admin/organizations", {
      description: "Organization deactivated!",
      type: "success",
    });
  } catch (error: any) {
    return redirectWithToast(
      `/admin/organizations/${organizationId}/deactivate`,
      {
        description: error.message || "Failed",
        type: "error",
      }
    );
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const organizationId = params.id;
  if (!organizationId) {
    return redirect("/admin/organizations");
  }

  const organization = await getOrganizationById(organizationId);

  if (!organization) {
    return redirect("/admin/organizations");
  }

  return json({ organization });
}

export default function AdminActivateOrganization() {
  const { organization } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const handleClose = () => navigate("/admin/organizations");

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate organization</DialogTitle>
          <DialogDescription>Lorem ipsum dolor sit.</DialogDescription>
        </DialogHeader>
        <p>Are you sure to deactivate this organization</p>
        <Label>Type "{organization.name}" to confirm</Label>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
        <Form method="post">
          <div className="mt-10 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={confirmText !== organization.name || submitting}
            >
              {submitting ? "Deactivating" : "Deactivate"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

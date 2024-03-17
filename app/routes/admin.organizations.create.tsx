import { type ActionFunctionArgs } from "@remix-run/node";
import { Form, useNavigate, useNavigation } from "@remix-run/react";

import { createOrganization } from "~/services/organization.server";
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
import { Textarea } from "~/components/ui/textarea";
import { authenticator } from "~/services/auth.server";
import { redirectWithToast } from "~/utils/toast.server";

export async function action({ request }: ActionFunctionArgs) {
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

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  try {
    await createOrganization({ name, description });
    return redirectWithToast("/admin/organizations", {
      description: "New organization created!",
      type: "success",
    });
  } catch (error: any) {
    return redirectWithToast("/admin/organizations/create", {
      description: error.message || "Failed",
      type: "error",
    });
  }
}

export default function AdminCreateOrganization() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const handleClose = () => navigate("/admin/organizations");

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Organization is use for grouping your data
          </DialogDescription>
        </DialogHeader>
        <Form method="post">
          <div className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input name="name" required />
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground leading-none">
                  Optional
                </p>
              </div>
              <Textarea name="description" />
            </div>
          </div>
          <div className="mt-10 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating" : "Create"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

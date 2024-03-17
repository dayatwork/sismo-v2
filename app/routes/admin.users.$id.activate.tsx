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

import { activateUser, getUserById } from "~/services/user.server";
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
  const userId = params.id;
  if (!userId) {
    return redirect("/admin/users");
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
    await activateUser(userId);
    return redirectWithToast("/admin/users", {
      description: "User activated!",
      type: "success",
    });
  } catch (error: any) {
    return redirectWithToast(`/admin/users/${userId}/activate`, {
      description: error.message || "Failed",
      type: "error",
    });
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = params.id;
  if (!userId) {
    return redirect("/admin/users");
  }

  const user = await getUserById(userId);

  if (!user) {
    return redirect("/admin/users");
  }

  return json({ user });
}

export default function AdminActivateUser() {
  const { user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const handleClose = () => navigate("/admin/users");

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activate user</DialogTitle>
          <DialogDescription>Lorem ipsum dolor sit.</DialogDescription>
        </DialogHeader>
        <p>Are you sure to activate this user</p>
        <Label>Type "{user.name}" to confirm</Label>
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
              disabled={confirmText !== user.name || submitting}
            >
              {submitting ? "Activating" : "Activate"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

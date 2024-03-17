import { Outlet } from "@remix-run/react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <Outlet />
    </div>
  );
}

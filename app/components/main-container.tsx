import React from "react";
import { cn } from "~/lib/utils";

export default function MainContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(className, "max-w-7xl mx-auto py-6 h-[calc(100vh-4rem)]")}
    >
      <div className="px-4 sm:px-6 lg:px-8 pb-10">{children}</div>
    </main>
  );
}

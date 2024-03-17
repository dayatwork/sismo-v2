import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 tracking-wide",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        gray: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        red: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        green:
          "border-transparent bg-green-600 text-green-50 hover:bg-green-600/80 dark:bg-green-700 dark:hover:bg-green-700/80",
        blue: "border-transparent bg-blue-600 text-blue-50 hover:bg-blue-600/80 dark:bg-blue-700 dark:hover:bg-blue-700/80",
        yellow:
          "border-transparent bg-yellow-600 text-yellow-50 hover:bg-yellow-600/80 dark:bg-yellow-700 dark:hover:bg-yellow-700/80",
        indigo:
          "border-transparent bg-indigo-600 text-indigo-50 hover:bg-indigo-600/80 dark:bg-indigo-700 dark:hover:bg-indigo-700/80",
        pink: "border-transparent bg-pink-600 text-pink-50 hover:bg-pink-600/80 dark:bg-pink-700 dark:hover:bg-pink-700/80",
        purple:
          "border-transparent bg-purple-600 text-purple-50 hover:bg-purple-600/80 dark:bg-purple-700 dark:hover:bg-purple-700/80",
        cyan: "border-transparent bg-cyan-600 text-cyan-50 hover:bg-cyan-600/80 dark:bg-cyan-700 dark:hover:bg-cyan-700/80",
        orange:
          "border-transparent bg-orange-600 text-orange-50 hover:bg-orange-600/80 dark:bg-orange-700 dark:hover:bg-orange-700/80",
        lime: "border-transparent bg-lime-600 text-lime-50 hover:bg-lime-600/80 dark:bg-lime-700 dark:hover:bg-lime-700/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

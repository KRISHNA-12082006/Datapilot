import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-[#c3b8ff] border-primary/25",
        secondary: "bg-surface-2 text-muted border-border",
        outline: "bg-transparent text-foreground border-border-strong",
        success: "bg-success/15 text-success border-success/25",
        warning: "bg-warning/15 text-warning border-warning/25",
        danger: "bg-danger/15 text-danger border-danger/25",
        cyan: "bg-secondary/15 text-secondary border-secondary/25",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

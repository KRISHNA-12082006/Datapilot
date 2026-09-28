import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_1px_2px_rgba(0,0,0,0.4)] hover:brightness-110 active:brightness-95",
        gradient:
          "text-white bg-[linear-gradient(120deg,#6d5bfa,#17b6d4)] shadow-[0_1px_2px_rgba(0,0,0,0.4)] hover:shadow-[0_0_24px_rgba(109,91,250,0.45)] active:brightness-95",
        secondary:
          "bg-surface-2 text-foreground border border-border hover:bg-surface-2/70 hover:border-border-strong",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface-2/60 hover:border-border-strong",
        ghost: "text-muted hover:text-foreground hover:bg-surface-2/60",
        destructive: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

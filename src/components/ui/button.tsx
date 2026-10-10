import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_10px_26px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,0,0,0.4)]",
        glass:
          "liquid-glass rounded-full text-foreground hover:scale-[1.03]",
        secondary:
          "surface text-foreground hover:-translate-y-0.5 hover:border-[hsl(var(--muted-foreground)/0.4)]",
        ghost: "text-foreground hover:bg-[hsl(var(--foreground)/0.08)]",
        danger:
          "bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-[0_10px_26px_rgba(244,63,94,0.3)] hover:-translate-y-0.5",
      },
      size: {
        default: "px-5 py-3",
        sm: "px-3.5 py-2 text-[13px] rounded-[10px]",
        lg: "px-14 py-5 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };

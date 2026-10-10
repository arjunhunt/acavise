import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-extrabold tracking-wide",
  {
    variants: {
      tone: {
        green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
        amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
        rose: "border-rose-400/30 bg-rose-400/10 text-rose-300",
        blue: "border-indigo-400/30 bg-indigo-400/10 text-indigo-200",
        cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
        orange: "border-orange-400/30 bg-orange-400/10 text-orange-300",
        neutral: "border-border bg-white/[0.04] text-muted-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };

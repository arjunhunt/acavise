import { cn } from "../../lib/utils";

export function Progress({
  value,
  tone = "default",
  className,
}: {
  value: number;
  tone?: "default" | "green" | "amber" | "rose";
  className?: string;
}) {
  const bar =
    tone === "green"
      ? "from-emerald-400 to-cyan-400"
      : tone === "amber"
        ? "from-amber-400 to-orange-400"
        : tone === "rose"
          ? "from-rose-400 to-rose-600"
          : "from-white to-white/60";
  return (
    <div className={cn("mt-2.5 h-[9px] overflow-hidden rounded-full bg-white/10", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", bar)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

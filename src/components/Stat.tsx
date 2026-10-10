import type { ReactNode } from "react";
import { Card } from "./ui/card";
import { useCountUp } from "../hooks/hooks";

export function Stat({
  label,
  value,
  decimals = 0,
  suffix = "",
  sub,
  bar,
  barTone = "default",
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  sub?: ReactNode;
  bar?: number;
  barTone?: "default" | "green" | "amber" | "rose";
}) {
  const n = useCountUp(value, decimals);
  const barCls =
    barTone === "green"
      ? "from-emerald-400 to-cyan-400"
      : barTone === "amber"
        ? "from-amber-400 to-orange-400"
        : barTone === "rose"
          ? "from-rose-400 to-rose-600"
          : "from-white to-white/60";
  return (
    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="text-[13px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-[clamp(26px,3vw,34px)] font-extrabold leading-none tracking-tight">
        {n}
        {suffix}
      </div>
      {sub && <div className="mt-1.5 text-[13px] text-muted-foreground">{sub}</div>}
      {bar !== undefined && (
        <div className="mt-2.5 h-[9px] overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${barCls}`}
            style={{ width: `${Math.min(100, Math.max(0, bar))}%` }}
          />
        </div>
      )}
    </Card>
  );
}

export function PageHead({
  kicker,
  title,
  sub,
  actions,
}: {
  kicker: string;
  title: string;
  sub: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3.5">
      <div>
        <span className="inline-block rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-[11px] font-extrabold tracking-[0.12em] text-indigo-200">
          {kicker}
        </span>
        <h1 className="mt-2.5 font-display text-[clamp(24px,3.4vw,34px)] leading-tight">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{sub}</p>
      </div>
      {actions && <div className="flex gap-2.5">{actions}</div>}
    </div>
  );
}

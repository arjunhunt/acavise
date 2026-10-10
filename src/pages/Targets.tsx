import { useState } from "react";
import { useApp } from "../lib/useApp";
import { getSubjects, updateUser } from "../lib/store";
import { requiredSGPA, feasibility, endtermProjection, completedCredits, requiredEndterm } from "../lib/calc";
import { PageHead } from "../components/Stat";
import { Card, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input, Field } from "../components/ui/input";

const TIERS: [number, string, "green" | "amber" | "orange" | "rose", string][] = [
  [8.5, "Highly Achievable", "green", "≤ 8.50 — steady pace holds."],
  [9.3, "Challenging", "amber", "8.51–9.30 — needs focused correction."],
  [10, "Near-Perfection", "orange", "9.31–10.00 — topper-level consistency."],
  [99, "Infeasible", "rose", "> 10.00 — revise target or add credits."],
];

export function Targets() {
  const { user, refresh } = useApp();
  const [tick, setTick] = useState(0);
  if (!user) return null;

  const subs = getSubjects(user.id, user.sem);
  const req = requiredSGPA(user.targetCgpa, user.currentCgpa, user.sem, user.totalCredits);
  const fe = feasibility(req);
  const proj = endtermProjection(req);
  const comp = completedCredits(user.sem);
  const rem = user.totalCredits - comp;

  const liveTarget = (v: number) => {
    const c = Math.min(10, Math.max(0, v || 0));
    updateUser({ targetCgpa: c });
    setTick((t) => t + 1);
    window.clearTimeout((window as unknown as { __tgt: number }).__tgt);
    (window as unknown as { __tgt: number }).__tgt = window.setTimeout(() => refresh(), 450);
  };
  void tick;

  return (
    <div>
      <PageHead
        kicker="Reverse calculator"
        title="Target Marks & CGPA Simulator"
        sub="Exact scores needed to graduate with your goal. Edit the target — everything recalculates live."
      />
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        <Card className="transition-all duration-300 hover:-translate-y-1">
          <div className="text-[13px] text-muted-foreground">Target graduation CGPA</div>
          <div className="mt-1 text-[clamp(26px,3vw,34px)] font-extrabold leading-none text-[hsl(var(--info))]">
            {req > 10 ? "—" : req.toFixed(2)}
          </div>
          <Field label="Adjust target (0–10)">
            <input
              type="range" min={6} max={10} step={0.05} value={user.targetCgpa}
              onChange={(e) => liveTarget(Number(e.target.value))} className="w-full"
            />
          </Field>
          <Input type="number" step={0.05} min={0} max={10} value={user.targetCgpa} onChange={(e) => liveTarget(Number(e.target.value))} />
        </Card>

        <Card className="transition-all duration-300 hover:-translate-y-1">
          <div className="text-[13px] text-muted-foreground">Current standing</div>
          <div className="mt-1 text-[clamp(26px,3vw,34px)] font-extrabold leading-none">{Number(user.currentCgpa).toFixed(2)}</div>
          <div className="mt-1.5 text-[13px] text-muted-foreground">
            {comp} credits done • {rem} remaining of {user.totalCredits}<br />Sem {user.sem} • {user.gradingScale}-point scale
          </div>
          <Field label="Update current CGPA">
            <Input
              type="number" step={0.01} min={0} max={10} value={user.currentCgpa}
              onChange={(e) => { updateUser({ currentCgpa: Number(e.target.value) || 0 }); refresh(); }}
            />
          </Field>
        </Card>

        <Card className="transition-all duration-300 hover:-translate-y-1">
          <div className="text-[13px] text-muted-foreground">Required future SGPA</div>
          <div className="mt-1 text-[clamp(26px,3vw,34px)] font-extrabold leading-none">{req > 10 ? "∞" : req.toFixed(2)}</div>
          <div className="mt-1.5"><Badge tone={fe.cls}>{fe.label}</Badge></div>
          <p className="mt-2 text-[13px] text-muted-foreground">≈ <b className="text-foreground">{proj}%</b> average across upcoming final exams.</p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-black/30 p-3.5 font-mono text-[13px] leading-relaxed text-foreground/90">
            ({user.targetCgpa}×{user.totalCredits} − {user.currentCgpa}×{comp}) ÷ {rem} = {req.toFixed(2)}
          </div>
        </Card>
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <Card>
          <CardTitle>Feasibility scale</CardTitle>
          {(() => {
            const youIdx = TIERS.findIndex(([lim]) => req <= lim);
            return TIERS.map(([lim, label, tone, desc], ti) => (
              <div key={label} className="flex items-center gap-3 border-b border-dashed border-border py-2.5 last:border-0">
                <Badge tone={tone}>{label}</Badge>
                <span className="text-xs text-muted-foreground">{desc}</span>
                <b className={`ml-auto font-mono ${ti === youIdx ? "text-emerald-300" : "text-muted-foreground"}`}>
                  {ti === youIdx ? "◀ YOU" : ""}
                </b>
              </div>
            ));
          })()}
        </Card>
        <Card>
          <CardTitle>Course-by-course target matrix</CardTitle>
          <CardDescription>Minimum endterm score for each target grade ({user.intW}/{user.endW} weighting).</CardDescription>
          <div className="overflow-x-auto">
            <table className="mt-1 w-full min-w-[520px] border-collapse text-[13.5px]">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  {["Course", "Internal", "Target", "Needs in finals", "Verdict"].map((h) => (
                    <th key={h} className="border-b border-border px-2.5 py-2.5 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => {
                  const need = requiredEndterm(s, user);
                  const ok = need <= 100;
                  return (
                    <tr key={s.id} className="transition hover:bg-white/[0.03]">
                      <td className="border-b border-border px-2.5 py-2.5"><b>{s.code}</b><br /><span className="text-xs text-muted-foreground">{s.name}</span></td>
                      <td className="border-b border-border px-2.5 py-2.5">{s.score}% ({s.credits}cr)</td>
                      <td className="border-b border-border px-2.5 py-2.5">{s.targetGrade}</td>
                      <td className="border-b border-border px-2.5 py-2.5">
                        <b className={need > 100 ? "text-rose-300" : need > 85 ? "text-amber-300" : "text-emerald-300"}>
                          {need > 100 ? "∞ impossible" : `${need}%`}
                        </b>
                      </td>
                      <td className="border-b border-border px-2.5 py-2.5">
                        <Badge tone={ok ? "green" : "rose"}>{ok ? "On track" : "Recalibrate"}</Badge>
                      </td>
                    </tr>
                  );
                }) || (
                  <tr><td colSpan={5} className="px-2.5 py-3 text-muted-foreground">Add subjects to build the matrix.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Download, ArrowRight } from "lucide-react";
import { useApp } from "../lib/useApp";
import { getSubjects } from "../lib/store";
import { priorityScore, urgencyOf, diagnosis, studyAction, requiredSGPA } from "../lib/calc";
import { PageHead } from "../components/Stat";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { toast } from "../lib/toast";

export function Priority() {
  const { user } = useApp();
  if (!user) return null;

  const subs = getSubjects(user.id, user.sem);
  const ranked = subs
    .map((s) => ({ ...s, ps: priorityScore(s), urg: urgencyOf(s) }))
    .sort((a, b) => b.ps - a.ps);
  const totalCredits = ranked.reduce((a, x) => a + x.credits, 0);

  const exportBrief = () => {
    const txt =
      `AcaVise Study Brief — ${user.name} (Sem ${user.sem}) — ${new Date().toLocaleString()}\n` +
      `CGPA ${user.currentCgpa} → Target ${user.targetCgpa} | Required SGPA ${requiredSGPA(user.targetCgpa, user.currentCgpa, user.sem, user.totalCredits)}\n\n` +
      ranked.map((s, i) =>
        `#${i + 1} ${s.code} ${s.name} — Priority ${s.ps}/100 (${urgencyOf(s).label})\n   Score ${s.score}% | Att ${s.attendance}% | ${s.credits}cr\n   Why: ${diagnosis(s)}\n   Do: ${studyAction(s)}\n`,
      ).join("\n");
    const b = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "acavise-study-brief.txt";
    a.click();
    toast("Study brief downloaded");
  };

  return (
    <div>
      <PageHead
        kicker="ROI ranking engine"
        title="Study Priority Engine"
        sub="Ranked by return-on-investment: Priority = Deficit + Credits × 2. Stop deciding — start executing Rank #1."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={exportBrief}><Download className="h-4 w-4" /> Export brief (.txt)</Button>
            <Link to="/planner"><Button size="sm"><ArrowRight className="h-4 w-4" /> Push to planner</Button></Link>
          </>
        }
      />
      {ranked.length ? (
        <div className="flex flex-col gap-3">
          {ranked.map((s, i) => (
            <Card
              key={s.id}
              className="animate-fade-rise transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.07}s`, borderLeft: `4px solid ${s.urg.cls === "rose" ? "hsl(var(--crit))" : s.urg.cls === "amber" ? "hsl(var(--warn))" : "hsl(var(--ok))"}` }}
            >
              <div className="flex flex-wrap items-start gap-3.5">
                <div className="font-mono text-[13px] text-muted-foreground">
                  RANK<br /><span className="text-3xl font-extrabold text-foreground">#{i + 1}</span>
                </div>
                <div className="min-w-[220px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold tracking-tight">{s.code} — {s.name}</h3>
                    <Badge tone={s.urg.cls}>{s.urg.label}</Badge>
                    <Badge tone="blue">{s.credits} Credits — Wt {Math.round((s.credits / Math.max(1, totalCredits)) * 100)}%</Badge>
                  </div>
                  <p className="mt-1.5 text-[13.5px]"><b>Diagnosis:</b> {diagnosis(s)}</p>
                  <p className="text-[13.5px] text-muted-foreground"><b className="text-[hsl(var(--info))]">Action:</b> {studyAction(s)}</p>
                  <Progress value={s.ps} tone={s.urg.cls} />
                </div>
                <div className="min-w-[90px] text-center">
                  <div className="font-mono text-3xl font-extrabold">{s.ps}</div>
                  <div className="text-[11px] text-muted-foreground">PRIORITY / 100</div>
                  <div className="mt-1.5 text-xs text-muted-foreground">Score {s.score}% • Att {s.attendance}%</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card><p className="text-sm text-muted-foreground">No subjects to rank. <Link to="/academics" className="font-bold text-foreground hover:underline">Add courses first →</Link></p></Card>
      )}
      <Card className="mt-3.5">
        <h3 className="text-base font-bold tracking-tight">How the score works</h3>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-foreground/90">
          Deficit = max(0, 100 − Score) • Priority = min(100, max(10, Deficit + Credits×2)) • High &lt;65% • Medium 65–80% • Low ≥80%
        </div>
      </Card>
    </div>
  );
}

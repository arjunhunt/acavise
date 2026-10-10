import { Link, useNavigate } from "react-router-dom";
import { Plus, Target, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useApp } from "../lib/useApp";
import { getSubjects, getDeadlines } from "../lib/store";
import { sgpaOf, attendanceOf, attTag, standingOf, priorityScore, urgencyOf, studyAction, daysUntil } from "../lib/calc";
import { Stat, PageHead } from "../components/Stat";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export function Dashboard() {
  const { user } = useApp();
  const navigate = useNavigate();
  if (!user) return null;

  const subs = getSubjects(user.id, user.sem);
  const sg = sgpaOf(subs);
  const att = attendanceOf(subs);
  const tag = attTag(att, user.cutoff);
  const gap = user.targetCgpa - user.currentCgpa;
  const credits = subs.reduce((a, s) => a + Number(s.credits || 0), 0);
  const dls = getDeadlines(user.id)
    .map((d) => ({ ...d, days: daysUntil(d.date) }))
    .filter((d) => d.days >= 0)
    .sort((a, b) => a.days - b.days);
  const next = dls[0];
  const ranked = [...subs].sort((a, b) => priorityScore(b) - priorityScore(a));
  const worst = [...subs].sort((a, b) => Number(a.score) - Number(b.score))[0];

  const ask = (q: string) => navigate(`/ai-assistant?q=${encodeURIComponent(q)}`);

  return (
    <div>
      <PageHead
        kicker={`Semester ${user.sem} • ${user.branch}`}
        title={`Hey ${user.name.split(" ")[0]}, here is your academic health.`}
        sub="Live synthesis of SGPA, attendance, deadlines and focus — updated every time you edit a subject."
        actions={
          <>
            <Link to="/academics">
              <Button variant="secondary" size="sm"><Plus className="h-4 w-4" /> Add course</Button>
            </Link>
            <Link to="/targets">
              <Button size="sm"><Target className="h-4 w-4" /> Simulate target</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Current CGPA"
          value={Number(user.currentCgpa) || 0}
          decimals={2}
          sub={<>Target {Number(user.targetCgpa).toFixed(2)} • Gap <b className={gap > 0 ? "text-amber-300" : "text-emerald-300"}>{gap > 0 ? "+" : ""}{gap.toFixed(2)}</b></>}
          bar={((user.currentCgpa || 0) / 10) * 100}
        />
        <Stat
          label="Semester SGPA (est.)"
          value={sg}
          decimals={2}
          sub={`${credits} credits across ${subs.length} subjects`}
          bar={(sg / 10) * 100}
          barTone="green"
        />
        <Stat
          label="Attendance health"
          value={att}
          decimals={1}
          suffix="%"
          sub={<><Badge tone={tag.cls}>{tag.label}</Badge> <span className="ml-1 text-xs">cutoff {user.cutoff}%</span></>}
          bar={att}
          barTone={tag.cls === "green" ? "green" : tag.cls === "amber" ? "amber" : "rose"}
        />
        <Card>
          <div className="text-[13px] text-muted-foreground">Next critical deadline</div>
          {next ? (
            <>
              <div className="mt-1 text-[clamp(26px,3vw,34px)] font-extrabold leading-none tracking-tight">
                {next.days === 0 ? "Today" : `${next.days}d`}
              </div>
              <div className="mt-1.5 text-[13px]"><b>{next.title}</b><br /><span className="text-muted-foreground">{next.subjectCode} • {next.date}</span></div>
            </>
          ) : (
            <>
              <div className="mt-1 text-[clamp(26px,3vw,34px)] font-extrabold leading-none">—</div>
              <div className="mt-1.5 text-[13px] text-muted-foreground">No upcoming deadlines.</div>
            </>
          )}
        </Card>
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subject performance</CardTitle>
            <Link to="/academics" className="text-sm font-bold text-[hsl(var(--info))] hover:underline">Manage →</Link>
          </CardHeader>
          {subs.length ? subs.map((s) => {
            const st = standingOf(s);
            return (
              <div key={s.id} className="flex items-center gap-3 border-b border-dashed border-border py-3 last:border-0">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-extrabold uppercase text-primary-foreground">
                  {s.code.slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-bold">{s.code} • {s.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.credits} cr • {s.faculty || "—"} • Target {s.targetGrade || "A"} •{" "}
                    <b className="text-foreground">{s.score}%</b>{" "}
                    {s.trend ? (
                      <span className={s.trend > 0 ? "text-emerald-300" : "text-rose-300"}>
                        {s.trend > 0 ? <TrendingUp className="mr-0.5 inline h-3 w-3" /> : <TrendingDown className="mr-0.5 inline h-3 w-3" />}
                        {s.trend > 0 ? `+${s.trend}` : s.trend}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground"><Minus className="mr-0.5 inline h-3 w-3" />stable</span>
                    )}
                  </div>
                </div>
                <Badge tone={st.cls}>{st.label}</Badge>
              </div>
            );
          }) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No courses yet for Sem {user.sem}. <Link to="/academics" className="font-bold text-foreground hover:underline">Add your first subject →</Link>
            </p>
          )}
        </Card>

        <div className="flex flex-col gap-3.5">
          <Card className="border-indigo-400/20 bg-indigo-400/[0.06]">
            <CardTitle>Ask AcaVise</CardTitle>
            <p className="mt-1 text-[13px] text-muted-foreground">
              One-click prompts grounded in your lowest-scoring course{worst ? <> (<b>{worst.code}</b>)</> : ""}:
            </p>
            <div className="mt-2">
              {["What should I study today?", ...(worst ? [`What do I need in ${worst.name} for an ${worst.targetGrade || "A"}?`] : []), "How does my attendance look?"].map((p) => (
                <button
                  key={p}
                  onClick={() => ask(p)}
                  className="mb-1.5 mr-1.5 inline-block cursor-pointer rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3.5 py-2 text-[13px] font-semibold text-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-400/20"
                >
                  {p}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority focus — top 3</CardTitle>
              <Link to="/priority" className="text-sm font-bold text-[hsl(var(--info))] hover:underline">All →</Link>
            </CardHeader>
            {ranked.slice(0, 3).map((s, i) => {
              const ur = urgencyOf(s);
              return (
                <div key={s.id} className="flex items-center gap-3 border-b border-dashed border-border py-2.5 last:border-0">
                  <b className="font-mono text-muted-foreground">#{i + 1}</b>
                  <div className="flex-1">
                    <b className="text-[13.5px]">{s.code}</b> <Badge tone={ur.cls}>{ur.label}</Badge>
                    <div className="text-xs text-muted-foreground">{studyAction(s)}</div>
                  </div>
                  <b className="font-mono">{priorityScore(s)}</b>
                </div>
              );
            }) || <p className="text-sm text-muted-foreground">Add subjects to generate priorities.</p>}
          </Card>

          <Card>
            <CardTitle>Upcoming deadlines</CardTitle>
            <div className="relative mt-2.5 pl-5 before:absolute before:bottom-1.5 before:left-1.5 before:top-1.5 before:w-0.5 before:rounded before:bg-white/25">
              {dls.slice(0, 5).map((d) => (
                <div key={d.id} className="relative py-2.5">
                  <span className="absolute -left-5 top-4 h-2.5 w-2.5 rounded-full bg-[hsl(var(--info))] shadow-[0_0_0_4px_hsl(var(--info)/0.15)]" />
                  <b className="text-[13.5px]">{d.title}</b>{" "}
                  <Badge tone={d.days <= 3 ? "rose" : d.days <= 7 ? "amber" : "green"}>
                    {d.days === 0 ? "Today" : `In ${d.days}d`}
                  </Badge>
                  <div className="text-xs text-muted-foreground">{d.subjectCode} • {d.type} • {d.date}</div>
                </div>
              )) || <p className="text-sm text-muted-foreground">Nothing scheduled.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

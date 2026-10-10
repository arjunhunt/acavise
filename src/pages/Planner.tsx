import { useState } from "react";
import { Plus, Trash2, Flame } from "lucide-react";
import { useApp } from "../lib/useApp";
import { getPlan, savePlan, getSubjects, uid, type PlanBlock } from "../lib/store";
import { PageHead } from "../components/Stat";
import { Card, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
import { Input, Select, Field } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { toast } from "../lib/toast";
import { cn } from "../lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const dot: Record<string, string> = { High: "bg-rose-400", Medium: "bg-amber-400", Low: "bg-emerald-400" };

export function Planner() {
  const { user, refresh } = useApp();
  const [open, setOpen] = useState(false);
  const [nb, setNb] = useState({ day: "Monday", sub: "", task: "", dur: 45, pri: "Medium" as PlanBlock["priority"], slot: "06:00 PM – 07:00 PM" });
  if (!user) return null;

  const plan = getPlan(user.id);
  const subs = getSubjects(user.id, user.sem);
  const doneMin = plan.filter((p) => p.done).reduce((a, p) => a + Number(p.durationMin || 0), 0);
  const totMin = plan.reduce((a, p) => a + Number(p.durationMin || 0), 0);
  const pct = totMin ? Math.round((doneMin / totMin) * 100) : 0;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const streak = plan.some((p) => p.done) ? Math.min(12, 1 + Math.floor(plan.filter((p) => p.done).length / 2)) : 0;
  const hrs = (m: number) => (m / 60).toFixed(1) + "h";

  const save = () => {
    savePlan(user.id, [...plan, {
      id: uid(), day: nb.day, subjectCode: nb.sub || subs[0]?.code || "GEN",
      task: nb.task.trim() || "Study session", durationMin: Number(nb.dur),
      priority: nb.pri, timeSlot: nb.slot, done: false,
    }]);
    setOpen(false);
    setNb({ day: "Monday", sub: "", task: "", dur: 45, pri: "Medium", slot: "06:00 PM – 07:00 PM" });
    refresh();
    toast("Study block scheduled");
  };

  const toggle = (id: string) => {
    savePlan(user.id, plan.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));
    const b = plan.find((p) => p.id === id);
    if (b && !b.done) toast("Session complete — streak growing");
    refresh();
  };

  return (
    <div>
      <PageHead
        kicker="Execution board"
        title="Smart Weekly Planner"
        sub=""
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add study block</Button>}
      />
      <p className="-mt-3 mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        Priorities become calendar blocks. Check off sessions; hours and streak update live.
        <Flame className="h-4 w-4 text-orange-300" />
        <b className="text-foreground">{streak}-day streak</b>
      </p>

      <Card className="mb-3.5">
        <div className="flex justify-between text-[13.5px]">
          <b>{hrs(doneMin)} completed of {hrs(totMin)} scheduled</b>
          <b>{pct}%</b>
        </div>
        <Progress value={pct} tone={pct >= 70 ? "green" : pct >= 35 ? "amber" : "rose"} />
      </Card>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {DAYS.map((d) => {
          const blocks = plan.filter((p) => p.day === d);
          const dm = blocks.filter((p) => p.done).reduce((a, p) => a + Number(p.durationMin), 0);
          return (
            <div key={d} className={cn("surface rounded-2xl p-2.5", d === today && "border-[hsl(var(--info)/0.5)] shadow-[0_0_0_3px_hsl(var(--info)/0.12)]")}>
              <h4 className="mb-2 px-1 text-xs font-bold tracking-wider text-muted-foreground">
                {d.toUpperCase()}{d === today ? " • TODAY" : ""} — {dm}m
              </h4>
              {blocks.map((b) => (
                <div key={b.id} className={cn("mb-2 animate-fade-rise rounded-[10px] border border-border bg-[hsl(var(--surface))] p-2.5 text-xs", b.done && "opacity-55")}>
                  <div className="flex items-center gap-1.5">
                    <input type="checkbox" checked={b.done} onChange={() => toggle(b.id)} className="h-4 w-4 cursor-pointer" />
                    <b className={cn(b.done && "line-through")}>{b.subjectCode}</b>
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", dot[b.priority])} />
                    <span className="ml-auto text-[11px] text-muted-foreground">{b.durationMin}m</span>
                  </div>
                  <div className={cn("mt-1", b.done && "line-through")}>{b.task}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{b.timeSlot} • {b.priority}</div>
                  <Button variant="danger" size="sm" className="mt-1.5 px-2 py-1 text-[11px]" onClick={() => { savePlan(user.id, plan.filter((p) => p.id !== b.id)); refresh(); }}>
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              )) || <div className="px-1 text-xs text-muted-foreground">No blocks — rest or add one.</div>}
            </div>
          );
        })}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="New study block" description="Linked to your enrolled subjects.">
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <Field label="Day">
            <Select value={nb.day} onChange={(e) => setNb({ ...nb, day: e.target.value })} className="w-full">
              {DAYS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Subject">
            <Select value={nb.sub} onChange={(e) => setNb({ ...nb, sub: e.target.value })} className="w-full">
              {subs.map((s) => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
              {!subs.length && <option value="GEN">GEN — General</option>}
            </Select>
          </Field>
        </div>
        <Field label="Task / topic">
          <Input value={nb.task} onChange={(e) => setNb({ ...nb, task: e.target.value })} placeholder="Review Dynamic Programming Graphs" />
        </Field>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <Field label="Duration">
            <Select value={nb.dur} onChange={(e) => setNb({ ...nb, dur: Number(e.target.value) })} className="w-full">
              {[30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={nb.pri} onChange={(e) => setNb({ ...nb, pri: e.target.value as PlanBlock["priority"] })} className="w-full">
              {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Time slot">
          <Input value={nb.slot} onChange={(e) => setNb({ ...nb, slot: e.target.value })} placeholder="08:00 PM – 09:30 PM" />
        </Field>
        <div className="mt-4 flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="flex-[2]" onClick={save}>Schedule block</Button>
        </div>
      </Dialog>
    </div>
  );
}

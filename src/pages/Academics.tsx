import { useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import { useApp } from "../lib/useApp";
import {
  getSubjects, saveSubject, deleteSubject, getDeadlines, saveDeadlines, updateUser, uid,
  type Subject,
} from "../lib/store";
import { sgpaOf, attendanceOf, standingOf, GRADE_PCT } from "../lib/calc";
import { Stat, PageHead } from "../components/Stat";
import { Card, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog } from "../components/ui/dialog";
import { Input, Select, Field } from "../components/ui/input";
import { toast } from "../lib/toast";
import { cn } from "../lib/utils";

const ASSESS_TYPES = ["Internal Assessment 1", "Internal Assessment 2", "Midterm Examination", "Lab / Project", "Quiz", "End-Sem Projection"];

export function Academics() {
  const { user, refresh } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", code: "", credits: 3, grade: "A", faculty: "", score: 70, att: 80 });
  const [as, setAs] = useState({ type: ASSESS_TYPES[0], weight: 20, max: 20, obt: 14 });
  const [dl, setDl] = useState({ title: "", type: "Midterm", code: "", date: "" });

  if (!user) return null;
  const sem = user.sem;
  const subs = getSubjects(user.id, sem);
  const sg = sgpaOf(subs);
  const att = attendanceOf(subs);
  const credits = subs.reduce((a, s) => a + Number(s.credits || 0), 0);
  const inspected = inspectId ? subs.find((s) => s.id === inspectId) || null : null;

  const set = (patch: Partial<typeof f>) => setF({ ...f, ...patch });

  const saveNew = () => {
    if (!f.name.trim() || !f.code.trim()) return toast("Name and code are required", "err");
    saveSubject(user.id, sem, {
      id: "", name: f.name.trim(), code: f.code.trim().toUpperCase(),
      credits: Number(f.credits) || 3, targetGrade: f.grade, faculty: f.faculty.trim(),
      score: Number(f.score) || 0, attendance: Number(f.att) || 0, trend: 0, assessments: [],
    });
    setAddOpen(false);
    setF({ name: "", code: "", credits: 3, grade: "A", faculty: "", score: 70, att: 80 });
    refresh();
    toast(`${f.code.toUpperCase()} registered`);
  };

  const addAssessment = () => {
    if (!inspected) return;
    const next: Subject = {
      ...inspected,
      assessments: [...inspected.assessments, { type: as.type, weight: Number(as.weight) || 0, max: Number(as.max) || 20, obtained: Number(as.obt) || 0 }],
    };
    const avg = next.assessments.length
      ? Math.round(next.assessments.reduce((a, x) => a + (x.obtained / x.max) * 100, 0) / next.assessments.length)
      : next.score;
    next.score = Math.min(100, avg);
    next.trend = 1;
    saveSubject(user.id, sem, next);
    refresh();
    toast("Assessment recorded");
  };

  const delAssessment = (i: number) => {
    if (!inspected) return;
    const next = { ...inspected, assessments: inspected.assessments.filter((_, x) => x !== i) };
    saveSubject(user.id, sem, next);
    refresh();
  };

  const addDeadline = () => {
    if (!dl.title.trim() || !dl.date) return toast("Title and date required", "err");
    saveDeadlines(user.id, [...getDeadlines(user.id), {
      id: uid(), title: dl.title.trim(), type: dl.type,
      subjectCode: dl.code.trim().toUpperCase() || "GEN", date: dl.date,
    }]);
    setDl({ title: "", type: "Midterm", code: "", date: "" });
    refresh();
    toast("Milestone added");
  };

  const dls = getDeadlines(user.id).slice().sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dayCount = (ds: string) => Math.round((new Date(ds + "T00:00:00").getTime() - today.getTime()) / 864e5);

  return (
    <div>
      <PageHead
        kicker="Course registry"
        title="Academics & Course Manager"
        sub="Track current, past and future curriculum. Click any subject for its assessment inspector."
        actions={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add subject</Button>}
      />

      <div className="mb-3.5 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
          const st = s < sem ? "Completed" : s === sem ? "In Progress" : "Upcoming";
          return (
            <button
              key={s}
              onClick={() => { updateUser({ sem: s }); refresh(); }}
              className={cn(
                "surface cursor-pointer rounded-[11px] px-4 py-2 text-[13px] font-bold text-muted-foreground transition hover:text-foreground",
                s === sem && "border-transparent bg-primary text-primary-foreground shadow-lg",
              )}
            >
              Sem {s} • {st}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        <Stat label="Registered credits" value={credits} />
        <Stat label="Semester SGPA" value={sg} decimals={2} />
        <Stat label="Avg attendance" value={att} decimals={1} suffix={att ? "%" : ""} />
        <Card>
          <div className="text-[13px] text-muted-foreground">Term status</div>
          <div className="mt-2">
            <Badge tone="cyan">{sem < user.sem ? "Completed" : sem === user.sem ? "In Progress" : "Upcoming"}</Badge>
          </div>
        </Card>
      </div>

      <Card className="mt-3.5">
        <CardTitle>Sem {sem} subjects ({subs.length})</CardTitle>
        {subs.length ? (
          <div className="mt-2 overflow-x-auto">
            <table className="mt-1 w-full min-w-[640px] border-collapse text-[13.5px] sm:min-w-0">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  {["Code", "Subject", "Credits", "Faculty", "Score", "Att.", "Target", "Standing", ""].map((h) => (
                    <th key={h} className="border-b border-border px-2.5 py-2.5 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => {
                  const st = standingOf(s);
                  return (
                    <tr key={s.id} className="transition hover:bg-white/[0.03]">
                      <td className="border-b border-border px-2.5 py-2.5 font-mono"><b>{s.code}</b></td>
                      <td className="border-b border-border px-2.5 py-2.5"><b>{s.name}</b></td>
                      <td className="border-b border-border px-2.5 py-2.5">{s.credits}</td>
                      <td className="border-b border-border px-2.5 py-2.5">{s.faculty || "—"}</td>
                      <td className="border-b border-border px-2.5 py-2.5"><b>{s.score}%</b></td>
                      <td className="border-b border-border px-2.5 py-2.5">{s.attendance}%</td>
                      <td className="border-b border-border px-2.5 py-2.5">{s.targetGrade}</td>
                      <td className="border-b border-border px-2.5 py-2.5"><Badge tone={st.cls}>{st.label}</Badge></td>
                      <td className="whitespace-nowrap border-b border-border px-2.5 py-2.5">
                        <Button variant="secondary" size="sm" onClick={() => setInspectId(s.id)}>
                          <Search className="h-3.5 w-3.5" /> Inspect
                        </Button>{" "}
                        <Button variant="danger" size="sm" onClick={() => { deleteSubject(user.id, sem, s.id); refresh(); toast("Subject removed", "warn"); }}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2.5 text-sm text-muted-foreground">No subjects in Sem {sem} yet. Click <b>Add subject</b> to register your first course.</p>
        )}

        <div className="surface mt-3.5 rounded-xl p-4">
          <CardTitle>Assessment milestones</CardTitle>
          {dls.length ? dls.map((d) => {
            const days = dayCount(d.date);
            return (
              <div key={d.id} className="flex items-center gap-3 border-b border-dashed border-border py-2.5 last:border-0">
                <div className="flex-1">
                  <b>{d.title}</b>{" "}
                  <Badge tone={days < 0 ? "blue" : days <= 3 ? "rose" : days <= 7 ? "amber" : "green"}>
                    {days < 0 ? "Done" : days === 0 ? "Today" : `In ${days}d`}
                  </Badge>
                  <div className="text-xs text-muted-foreground">{d.subjectCode} • {d.type} • {d.date}</div>
                </div>
                <Button variant="danger" size="sm" onClick={() => { saveDeadlines(user.id, getDeadlines(user.id).filter((x) => x.id !== d.id)); refresh(); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          }) : <p className="text-sm text-muted-foreground">No milestones yet.</p>}
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Field label="Title"><Input value={dl.title} onChange={(e) => setDl({ ...dl, title: e.target.value })} placeholder="e.g. DBMS Midterm" /></Field>
            <Field label="Type">
              <Select value={dl.type} onChange={(e) => setDl({ ...dl, type: e.target.value })} className="w-full">
                {["Midterm", "Quiz", "Assignment", "Lab", "Final"].map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Field label="Subject code"><Input value={dl.code} onChange={(e) => setDl({ ...dl, code: e.target.value })} placeholder="CS501" /></Field>
            <Field label="Date"><Input type="date" value={dl.date} onChange={(e) => setDl({ ...dl, date: e.target.value })} /></Field>
          </div>
          <Button size="sm" className="mt-3" onClick={addDeadline}><Plus className="h-4 w-4" /> Add milestone</Button>
        </div>
      </Card>

      {/* Add subject */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add enrolled subject" description={`Registers a course in Semester ${sem}.`}>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <Field label="Course name *"><Input value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="Analysis of Algorithms" /></Field>
          <Field label="Course code *"><Input value={f.code} onChange={(e) => set({ code: e.target.value })} placeholder="CS501" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <Field label="Credits (1–6)"><Input type="number" min={1} max={6} value={f.credits} onChange={(e) => set({ credits: Number(e.target.value) })} /></Field>
          <Field label="Target grade">
            <Select value={f.grade} onChange={(e) => set({ grade: e.target.value })} className="w-full">
              {Object.keys(GRADE_PCT).map((g) => <option key={g}>{g}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <Field label="Faculty"><Input value={f.faculty} onChange={(e) => set({ faculty: e.target.value })} placeholder="Dr. Sharma" /></Field>
          <Field label="Current score %"><Input type="number" min={0} max={100} value={f.score} onChange={(e) => set({ score: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Attendance %"><Input type="number" min={0} max={100} value={f.att} onChange={(e) => set({ att: Number(e.target.value) })} /></Field>
        <div className="mt-4 flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button className="flex-[2]" onClick={saveNew}>Save subject</Button>
        </div>
      </Dialog>

      {/* Inspector */}
      <Dialog
        open={!!inspected}
        onClose={() => setInspectId(null)}
        title={inspected ? `${inspected.code} — inspector` : ""}
        description={inspected ? `${inspected.name} • ${inspected.credits} credits • Score ${inspected.score}% • Target ${inspected.targetGrade}` : ""}
      >
        {inspected && (
          <>
            <div className="my-3 h-[9px] overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-white to-white/60" style={{ width: `${inspected.score}%` }} />
            </div>
            <h4 className="mt-2 text-sm font-bold">Assessments ({inspected.assessments.length})</h4>
            {inspected.assessments.map((a, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-dashed border-border py-2.5 last:border-0">
                <div className="flex-1">
                  <b>{a.type}</b>
                  <div className="text-xs text-muted-foreground">{a.obtained}/{a.max} • weight {a.weight}% • <b>{Math.round((a.obtained / a.max) * 100)}%</b></div>
                </div>
                <Button variant="danger" size="sm" onClick={() => delAssessment(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            )) || <p className="text-sm text-muted-foreground">No assessments yet — add internals or midsem below.</p>}
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <Field label="Type">
                <Select value={as.type} onChange={(e) => setAs({ ...as, type: e.target.value })} className="w-full">
                  {ASSESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Weight %"><Input type="number" value={as.weight} onChange={(e) => setAs({ ...as, weight: Number(e.target.value) })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <Field label="Max marks"><Input type="number" value={as.max} onChange={(e) => setAs({ ...as, max: Number(e.target.value) })} /></Field>
              <Field label="Obtained"><Input type="number" value={as.obt} onChange={(e) => setAs({ ...as, obt: Number(e.target.value) })} /></Field>
            </div>
            <div className="mt-4 flex gap-2.5">
              <Button variant="secondary" className="flex-1" onClick={() => setInspectId(null)}>Done</Button>
              <Button className="flex-[2]" onClick={addAssessment}><Plus className="h-4 w-4" /> Add assessment</Button>
            </div>
            <p className="mt-2.5 text-xs text-muted-foreground">
              Total weightage: {inspected.assessments.reduce((a, x) => a + Number(x.weight || 0), 0)}% (internal {user.intW} / endterm {user.endW} in Settings)
            </p>
          </>
        )}
      </Dialog>
    </div>
  );
}

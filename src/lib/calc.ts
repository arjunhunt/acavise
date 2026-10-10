import type { Subject } from "./store";

export const GRADE_PCT: Record<string, number> = {
  O: 90, "A+": 80, A: 70, "B+": 60, B: 55, C: 50, P: 40,
};

export interface Urgency { label: "High" | "Medium" | "Low"; cls: "rose" | "amber" | "green" }
export interface Standing { label: string; cls: "green" | "amber" | "rose" }
export interface Feasibility { label: string; cls: "green" | "amber" | "orange" | "rose" }

export function sgpaOf(subjects: Subject[]): number {
  if (!subjects.length) return 0;
  let num = 0, den = 0;
  subjects.forEach((s) => {
    num += (Number(s.score || 0) / 10) * Number(s.credits || 0);
    den += Number(s.credits || 0);
  });
  return den ? +(num / den).toFixed(2) : 0;
}

export function attendanceOf(subjects: Subject[]): number {
  if (!subjects.length) return 0;
  let num = 0, den = 0;
  subjects.forEach((s) => {
    num += Number(s.attendance || 0) * Number(s.credits || 0);
    den += Number(s.credits || 0);
  });
  return den ? +(num / den).toFixed(1) : 0;
}

export function completedCredits(sem: number): number {
  return (Number(sem) - 1) * 20;
}

export function requiredSGPA(target: number, current: number, sem: number, total: number): number {
  const comp = completedCredits(sem);
  const rem = Number(total) - comp;
  if (rem <= 0) return 0;
  return +((Number(target) * Number(total) - Number(current) * comp) / rem).toFixed(2);
}

export function feasibility(req: number): Feasibility {
  if (req <= 8.5) return { label: "Highly Achievable", cls: "green" };
  if (req <= 9.3) return { label: "Challenging", cls: "amber" };
  if (req <= 10) return { label: "Requires Near-Perfection", cls: "orange" };
  return { label: "Infeasible — exceeds 10.0 scale", cls: "rose" };
}

export function endtermProjection(req: number): number {
  return Math.min(99, Math.max(35, Math.round(req * 10 - 6)));
}

export function priorityScore(s: Subject): number {
  const deficit = Math.max(0, 100 - Number(s.score || 0));
  return Math.min(100, Math.max(10, Math.round(deficit + Number(s.credits || 0) * 2)));
}

export function urgencyOf(s: Subject): Urgency {
  const sc = Number(s.score || 0);
  if (sc < 65) return { label: "High", cls: "rose" };
  if (sc < 80) return { label: "Medium", cls: "amber" };
  return { label: "Low", cls: "green" };
}

export function standingOf(s: Subject): Standing {
  const sc = Number(s.score || 0);
  if (sc >= 75) return { label: "Good Standing", cls: "green" };
  if (sc >= 60) return { label: "Needs Attention", cls: "amber" };
  return { label: "Critical Focus", cls: "rose" };
}

export function attTag(pct: number, cutoff: number): Standing {
  if (pct >= Math.max(80, cutoff)) return { label: "Safe Standing", cls: "green" };
  if (pct >= cutoff) return { label: "Attendance Warning", cls: "amber" };
  return { label: "Critical Shortfall", cls: "rose" };
}

export function diagnosis(s: Subject): string {
  if (Number(s.score) < 65)
    return `Internal score (${s.score}%) is below the safe threshold for target grade ${s.targetGrade || "A"}. High grade-risk.`;
  if (Number(s.attendance) < 75)
    return `Attendance (${s.attendance}%) is near/below the mandatory cutoff. Marks at risk despite decent score.`;
  if (Number(s.score) < 80)
    return `Score (${s.score}%) trails the ${s.targetGrade || "A"} threshold (needs ~${GRADE_PCT[s.targetGrade] ?? 70}%). Small gap, high leverage.`;
  return `On track for ${s.targetGrade || "A"}. Hold the lead with light revision.`;
}

export function studyAction(s: Subject): string {
  const u = urgencyOf(s);
  if (u.label === "High") return `Dedicate 2 focused 45-min review sessions to ${s.code} internals + 1 past paper this week.`;
  if (u.label === "Medium") return `Do 1× 60-min concept block + 20 practice questions for ${s.code}.`;
  return `15-min daily flash revision to lock ${s.code}.`;
}

export interface AcaviseUserLike {
  intW: number;
  endW: number;
}

export function requiredEndterm(s: Subject, user: AcaviseUserLike): number {
  const thr = GRADE_PCT[s.targetGrade] ?? 70;
  const iw = Number(user.intW ?? 40) / 100;
  const ew = Number(user.endW ?? 60) / 100;
  if (ew <= 0) return thr;
  return Math.round((thr - Number(s.score || 0) * iw) / ew);
}

export function daysUntil(dateStr: string): number {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d.getTime() - t.getTime()) / 864e5);
}

export interface Notice {
  type: string;
  icon: string;
  title: string;
  desc: string;
}

export function buildNotifications(
  user: { notifExam: boolean; notifAtt: boolean; cutoff: number },
  subjects: Subject[],
  deadlines: { title: string; type: string; subjectCode: string; date: string }[],
): Notice[] {
  const n: Notice[] = [];
  (deadlines || []).forEach((d) => {
    const days = daysUntil(d.date);
    if (days >= 0 && days <= 7 && user.notifExam)
      n.push({
        type: "exam",
        icon: "exam",
        title: `${d.title} in ${days === 0 ? "today" : days + " day(s)"}`,
        desc: `${d.subjectCode} • ${d.type} • ${d.date}`,
      });
  });
  (subjects || []).forEach((s) => {
    if (user.notifAtt && Number(s.attendance) < Number(user.cutoff || 75))
      n.push({
        type: "att",
        icon: "att",
        title: `Attendance risk: ${s.code}`,
        desc: `${s.attendance}% vs ${user.cutoff}% cutoff — attend next 3 classes to recover.`,
      });
  });
  const ranked = [...(subjects || [])].sort((a, b) => priorityScore(b) - priorityScore(a)).slice(0, 2);
  ranked.forEach((s) => {
    if (Number(s.score) < 70)
      n.push({ type: "prio", icon: "prio", title: `Focus: ${s.code} needs attention`, desc: `Priority ${priorityScore(s)}/100 • ${diagnosis(s)}` });
  });
  return n;
}

/** Minimal markdown-lite renderer for AI answers (escapes HTML first). */
export function md(t: string): string {
  return String(t || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^### (.*)$/gm, "<b>$1</b>")
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/\n/g, "<br>");
}

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send } from "lucide-react";
import { useApp } from "../lib/useApp";
import { getSubjects } from "../lib/store";
import {
  priorityScore, urgencyOf, diagnosis, studyAction, requiredSGPA, requiredEndterm,
  attendanceOf, attTag, feasibility, endtermProjection, completedCredits, GRADE_PCT, md,
} from "../lib/calc";
import { PageHead } from "../components/Stat";
import { Card, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

interface Msg {
  who: "bot" | "user";
  html?: string;
  typing?: boolean;
}

function brain(
  qraw: string,
  ctx: {
    subs: ReturnType<typeof getSubjects>;
    user: NonNullable<ReturnType<typeof import("../lib/store").currentUser>>;
  },
): string {
  const { subs, user } = ctx;
  const q = qraw.toLowerCase();
  const ranked = [...subs].sort((a, b) => priorityScore(b) - priorityScore(a));
  const top = ranked[0];
  const req = requiredSGPA(user.targetCgpa, user.currentCgpa, user.sem, user.totalCredits);
  const att = attendanceOf(subs);
  const hit = subs.find((s) => q.includes(s.code.toLowerCase()) || q.includes(s.name.toLowerCase()));

  if (/(today|study|focus|priority|first)/.test(q)) {
    if (!top) return "Add subjects in **Academics** first, then I will rank them.";
    return (
      `### Today's battle plan\n` +
      `- Start with **${top.code} — ${top.name}** (Priority **${priorityScore(top)}/100**, ${urgencyOf(top).label} urgency).\n` +
      `- Why: ${diagnosis(top)}\n- Do: ${studyAction(top)}\n` +
      `- Next: **${ranked[1] ? ranked[1].code + " (" + priorityScore(ranked[1]) + "/100)" : "—"}** after a 10-minute break.\n` +
      `- Recommended block: \`60–90 min\` on ${top.code} at your peak hour. Check it off in **Planner**.`
    );
  }
  if (hit || /(need|require|grade|marks|a\+|\bo\b)/.test(q)) {
    const s = hit || top;
    if (!s) return "Tell me a subject code (e.g. CS501) after adding courses.";
    const need = requiredEndterm(s, user);
    return (
      `### ${s.code} — path to **${s.targetGrade}**\n` +
      `- Current internal: **${s.score}%** (${s.credits} credits), attendance **${s.attendance}%**.\n` +
      `- Grade threshold: **~${GRADE_PCT[s.targetGrade] ?? 70}%** overall with your **${user.intW}/${user.endW}** weighting.\n` +
      `- You need **${need > 100 ? "over 100% — recalibrate target or boost internals" : need + "% in the endterm"}**.\n` +
      `- ${need > 100 ? "Talk to faculty about re-evaluation or extra internals, and shift focus to high-credit winnable subjects." : need > 85 ? "Tough but doable — 2 past papers plus daily 45-minute blocks." : "Very achievable — hold steady with revision."}`
    );
  }
  if (/(attend)/.test(q)) {
    const low = subs.filter((s) => s.attendance < user.cutoff);
    return (
      `### Attendance report — **${att}%** weighted (cutoff ${user.cutoff}%)\n` +
      `- Status: **${attTag(att, user.cutoff).label}**\n` +
      (low.length
        ? low.map((s) => `- **${s.code}**: ${s.attendance}% — attend the next 3 classes straight.`).join("\n")
        : "- Every subject is above cutoff. Keep it there.") +
      `\n- Formula: \`Σ(Att × Credits)/ΣCredits\``
    );
  }
  if (/(target|cgpa|formula|sgpa|feasib)/.test(q)) {
    const fe = feasibility(req);
    return (
      `### Target CGPA formula\n` +
      `- \`Required SGPA = (Target×Total − Current×Completed)/Remaining\`\n` +
      `- Yours: \`(${user.targetCgpa}×${user.totalCredits} − ${user.currentCgpa}×${completedCredits(user.sem)})/${user.totalCredits - completedCredits(user.sem)} = ${req}\`\n` +
      `- Verdict: **${fe.label}** — needs ~**${endtermProjection(req)}%** in finals.\n` +
      `- Tip: raise winnable high-credit subjects first; they move SGPA fastest.`
    );
  }
  if (/(plan|schedule|week|tomorrow)/.test(q))
    return `Open **Weekly Planner** and add a block: pick the day, choose **${top ? top.code : "your top subject"}**, set 45–90 min, High priority. Checking it off grows your streak.`;
  if (/(hello|hi|hey)/.test(q))
    return `Hello! I see **${subs.length} subjects**, CGPA **${user.currentCgpa} → ${user.targetCgpa}**, attendance **${att}%**. Ask me **"What should I study today?"** to begin.`;
  return (
    `### Here is your snapshot\n` +
    `- **Top focus:** ${top ? `**${top.code}** (${priorityScore(top)}/100) — ${studyAction(top)}` : "add subjects first"}\n` +
    `- **Required SGPA:** ${req} (${feasibility(req).label})\n` +
    `- **Attendance:** ${att}% (${attTag(att, user.cutoff).label})\n` +
    `- Try: \`What do I need in ${top ? top.code : "CS501"} for an A?\` or \`How does my attendance look?\``
  );
}

export function Assistant() {
  const { user } = useApp();
  const [params] = useSearchParams();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [inp, setInp] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const booted = useRef(false);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: 1e6 });
  }, [msgs]);

  useEffect(() => {
    if (booted.current || !user) return;
    booted.current = true;
    const first: Msg = {
      who: "bot",
      html: md(`Hey **${user.name.split(" ")[0]}** — I'm your AcaVise advisor. Ask me what to study, what you need for any grade, or how attendance looks. Try a pill below.`),
    };
    const pre = params.get("q");
    setMsgs([first]);
    if (pre) setTimeout(() => ask(pre), 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return null;
  const subs = getSubjects(user.id, user.sem);
  const ranked = [...subs].sort((a, b) => priorityScore(b) - priorityScore(a));
  const top = ranked[0];
  const pills = [
    "What should I study today?",
    ...(top ? [`What do I need in ${top.name} for an ${top.targetGrade || "A"}?`] : []),
    "How does my attendance look?",
    "Explain the Target CGPA formula.",
  ];

  const ask = (q: string) => {
    const u = user;
    const s = getSubjects(u.id, u.sem);
    setMsgs((m) => [...m, { who: "user", html: md(q) }, { who: "bot", typing: true }]);
    setTimeout(() => {
      const html = md(brain(q, { subs: s, user: u }));
      setMsgs((m) => {
        const next = [...m];
        next[next.length - 1] = { who: "bot", html };
        return next;
      });
    }, 650);
  };

  const send = () => {
    const v = inp.trim();
    if (!v) return;
    setInp("");
    ask(v);
  };

  return (
    <div>
      <PageHead
        kicker={`Grounded in Sem ${user.sem}`}
        title="AI Academic Assistant"
        sub={`Knows your ${subs.length} subjects, scores, attendance, target ${Number(user.targetCgpa).toFixed(2)} and #1 priority${top ? ` (${top.code})` : ""}. Rule-based engine — instant, offline, explainable.`}
      />
      <Card>
        <div ref={boxRef} className="flex max-h-[56vh] flex-col gap-3 overflow-y-auto p-0.5">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={
                m.who === "bot"
                  ? "surface max-w-[82%] animate-fade-rise self-start rounded-2xl rounded-tl-[5px] px-4 py-3 text-sm leading-relaxed max-sm:max-w-[94%]"
                  : "max-w-[82%] animate-fade-rise self-end rounded-2xl rounded-tr-[5px] bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-xl max-sm:max-w-[94%]"
              }
            >
              {m.typing ? (
                <span className="inline-flex gap-1.5 px-1.5 py-1.5">
                  {[0, 1, 2].map((d) => (
                    <i key={d} className="h-2 w-2 animate-pulse rounded-full bg-current opacity-60" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </span>
              ) : (
                <span
                  className="[&_code]:rounded-md [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_li]:ml-4 [&_li]:list-disc"
                  dangerouslySetInnerHTML={{ __html: m.html || "" }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="my-3">
          {pills.map((p) => (
            <button
              key={p}
              onClick={() => ask(p)}
              className="mb-1.5 mr-1.5 inline-block cursor-pointer rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3.5 py-2 text-[13px] font-semibold text-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-400/20"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2.5 max-sm:flex-col">
          <Input
            value={inp}
            onChange={(e) => setInp(e.target.value)}
            placeholder="Ask anything — e.g. 'What do I need in CS501 for an A?'"
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <Button onClick={send} className="max-sm:w-full">
            Send
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
      <Card className="mt-3.5">
        <CardTitle>What the assistant sees</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          {subs.map((s) => `${s.code} ${s.score}%/${s.attendance}%`).join(" • ") || "No subjects yet."} | CGPA {user.currentCgpa} → {user.targetCgpa} | Cutoff {user.cutoff}% | {user.intW}/{user.endW}
        </p>
      </Card>
    </div>
  );
}

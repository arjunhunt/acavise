import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, LogOut, Trash2, Sun, Moon, Monitor } from "lucide-react";
import { useApp } from "../lib/useApp";
import { updateUser, DB, K } from "../lib/store";
import { isCloud } from "../lib/cloud";
import { signOutEverywhere } from "../lib/cloud";
import { PageHead } from "../components/Stat";
import { Card, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input, Select, Field } from "../components/ui/input";
import { toast } from "../lib/toast";
import { applyTheme } from "../lib/useApp";
import { cn } from "../lib/utils";

const BRANCHES = ["Computer Engineering", "Information Technology", "Electronics", "Mechanical", "Electrical", "Civil"];

export function Settings() {
  const { user, refresh } = useApp();
  const navigate = useNavigate();
  const [p, setP] = useState({
    name: user?.name || "", college: user?.college || "", branch: user?.branch || BRANCHES[0],
    sem: user?.sem || 5, cgpa: user?.currentCgpa ?? 8, tcgpa: user?.targetCgpa ?? 9,
  });
  const [rules, setRules] = useState({
    scale: user?.gradingScale || "10", cut: user?.cutoff ?? 75,
    tot: user?.totalCredits ?? 160, w: `${user?.intW ?? 40}-${user?.endW ?? 60}`,
  });
  const [notifs, setNotifs] = useState({
    exam: user?.notifExam ?? true, att: user?.notifAtt ?? true, digest: user?.notifDigest ?? true,
  });

  if (!user) return null;
  const patch = (k: keyof typeof p, v: string | number) => setP({ ...p, [k]: v });

  const saveProfile = () => {
    updateUser({
      name: p.name.trim(), college: p.college.trim(), branch: p.branch, sem: Number(p.sem),
      currentCgpa: Number(p.cgpa) || 0, targetCgpa: Number(p.tcgpa) || 9,
    });
    refresh();
    toast("Profile saved");
  };

  const saveRules = () => {
    const [iw, ew] = rules.w.split("-").map(Number);
    updateUser({ gradingScale: rules.scale, cutoff: Number(rules.cut), totalCredits: Number(rules.tot), intW: iw, endW: ew });
    refresh();
    toast("Rules applied everywhere");
  };

  const saveNotifs = () => {
    updateUser({ notifExam: notifs.exam, notifAtt: notifs.att, notifDigest: notifs.digest });
    refresh();
    toast("Preferences saved");
  };

  const setTheme = (t: string) => {
    updateUser({ theme: t });
    DB.write("acavise_theme", t);
    applyTheme();
    refresh();
    toast(`${t} theme on`);
  };

  const wipe = () => {
    if (!window.confirm("Delete ALL subjects + planner + deadlines?")) return;
    DB.write(K.subjects(user.id), {});
    DB.write(K.plan(user.id), []);
    DB.write(K.deadlines(user.id), []);
    refresh();
    toast("Data reset", "warn");
  };

  const signOut = async () => {
    await signOutEverywhere();
    refresh();
    navigate("/");
  };

  return (
    <div>
      <PageHead
        kicker="Control center"
        title="Settings, Rules & Theme"
        sub="University rules drive every formula. Changes apply instantly everywhere."
        actions={
          <>
            {isCloud() ? <Badge tone="green">Cloud sync ON</Badge> : <Badge tone="amber">This-browser storage</Badge>}
            <Button variant="danger" size="sm" onClick={() => { if (window.confirm("Sign out?")) signOut(); }}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <Card>
          <CardTitle>Academic profile</CardTitle>
          <Field label="Full name"><Input value={p.name} onChange={(e) => patch("name", e.target.value)} /></Field>
          <Field label="Email"><Input value={user.email} disabled /></Field>
          <Field label="College"><Input value={p.college} onChange={(e) => patch("college", e.target.value)} placeholder="Your institute" /></Field>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Field label="Branch">
              <Select value={p.branch} onChange={(e) => patch("branch", e.target.value)} className="w-full">
                {BRANCHES.map((b) => <option key={b}>{b}</option>)}
              </Select>
            </Field>
            <Field label="Semester">
              <Select value={p.sem} onChange={(e) => patch("sem", Number(e.target.value))} className="w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Field label="Current CGPA"><Input type="number" step="0.01" value={p.cgpa} onChange={(e) => patch("cgpa", Number(e.target.value))} /></Field>
            <Field label="Target CGPA"><Input type="number" step="0.01" value={p.tcgpa} onChange={(e) => patch("tcgpa", Number(e.target.value))} /></Field>
          </div>
          <Button className="mt-4" onClick={saveProfile}><Save className="h-4 w-4" /> Save profile</Button>
        </Card>

        <div className="flex flex-col gap-3.5">
          <Card>
            <CardTitle>University academic rules</CardTitle>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <Field label="Grading scale">
                <Select value={rules.scale} onChange={(e) => setRules({ ...rules, scale: e.target.value })} className="w-full">
                  <option value="10">10-point (IN/EU)</option>
                  <option value="4">4-point (US)</option>
                </Select>
              </Field>
              <Field label="Attendance cutoff">
                <Select value={rules.cut} onChange={(e) => setRules({ ...rules, cut: Number(e.target.value) })} className="w-full">
                  {[75, 80, 85].map((c) => <option key={c} value={c}>{c}%</option>)}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <Field label="Total degree credits">
                <Select value={rules.tot} onChange={(e) => setRules({ ...rules, tot: Number(e.target.value) })} className="w-full">
                  {[120, 130, 140, 160, 180].map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Internal / Endterm weight">
                <Select value={rules.w} onChange={(e) => setRules({ ...rules, w: e.target.value })} className="w-full">
                  <option value="50-50">50 – 50</option>
                  <option value="40-60">40 – 60</option>
                  <option value="30-70">30 – 70</option>
                </Select>
              </Field>
            </div>
            <Button variant="secondary" className="mt-4" onClick={saveRules}>Apply rules</Button>
          </Card>

          <Card>
            <CardTitle>Notification preferences</CardTitle>
            {([["exam", "Exam & assessment countdowns (7-day)"], ["att", "Attendance shortfall warnings"], ["digest", "Weekly performance digest"]] as const).map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center gap-2.5 py-2 text-sm font-semibold">
                <input
                  type="checkbox" checked={notifs[k]}
                  onChange={(e) => setNotifs({ ...notifs, [k]: e.target.checked })}
                  className="h-[18px] w-[18px] cursor-pointer"
                />
                {label}
              </label>
            ))}
            <Button variant="secondary" className="mt-2.5" onClick={saveNotifs}>Save preferences</Button>
          </Card>

          <Card>
            <CardTitle>Appearance</CardTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              {([["light", Sun, "Light"], ["dark", Moon, "Dark"], ["system", Monitor, "System"]] as const).map(([v, Icon, label]) => (
                <button
                  key={v}
                  onClick={() => setTheme(v)}
                  className={cn(
                    "surface cursor-pointer rounded-[11px] px-4 py-2 text-[13px] font-bold text-muted-foreground transition hover:text-foreground",
                    (user.theme || "dark") === v && "bg-primary text-primary-foreground",
                  )}
                >
                  <Icon className="mr-1.5 inline h-4 w-4" />{label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground">System follows your OS preference automatically.</p>
            <div className="surface mt-3 rounded-xl border-rose-400/20 p-4">
              <CardTitle>Danger zone</CardTitle>
              <p className="mt-1 text-[13px] text-muted-foreground">Clears all subjects, planner and deadlines for this account.</p>
              <Button variant="danger" size="sm" className="mt-2" onClick={wipe}><Trash2 className="h-4 w-4" /> Reset all my data</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

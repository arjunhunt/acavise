import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket } from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input, Select, Field } from "../components/ui/input";
import { useApp } from "../lib/useApp";
import { updateUser } from "../lib/store";
import { toast } from "../lib/toast";

const BRANCHES = ["Computer Engineering", "Information Technology", "Electronics", "Mechanical", "Electrical", "Civil"];

export function Onboarding() {
  const { user, refresh } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [branch, setBranch] = useState(user?.branch || BRANCHES[0]);
  const [sem, setSem] = useState(user?.sem || 5);
  const [cgpa, setCgpa] = useState(user?.currentCgpa ?? 8);
  const [tcgpa, setTcgpa] = useState(user?.targetCgpa ?? 9);

  if (!user) return null;
  const guess = user.email.split("@")[0].replace(/[._-]+/g, " ");

  const submit = () => {
    updateUser({
      name: name.trim() || guess, branch, sem,
      currentCgpa: Number(cgpa) || 0, targetCgpa: Number(tcgpa) || 9,
      onboarded: true,
    });
    refresh();
    toast("Profile saved — welcome aboard");
    navigate("/dashboard");
  };

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <Card className="w-full max-w-xl animate-fade-rise">
        <Logo />
        <h1 className="mt-4 font-display text-3xl">Set your baseline.</h1>
        <p className="mt-1 text-sm text-muted-foreground">This powers every simulation.</p>
        <div className="my-4 flex gap-2">
          <span className="h-1.5 flex-1 rounded-full bg-primary" />
          <span className="h-1.5 flex-1 rounded-full bg-primary" />
          <span className="h-1.5 flex-1 rounded-full bg-white/15" />
        </div>
        <Field label="Full name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={guess} />
        </Field>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <Field label="Major / department">
            <Select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full">
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </Select>
          </Field>
          <Field label="Current semester">
            <Select value={sem} onChange={(e) => setSem(Number(e.target.value))} className="w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <Field label="Current CGPA">
            <Input type="number" step="0.01" min="0" max="10" value={cgpa} onChange={(e) => setCgpa(Number(e.target.value))} />
          </Field>
          <Field label="Target graduation CGPA">
            <Input type="number" step="0.01" min="0" max="10" value={tcgpa} onChange={(e) => setTcgpa(Number(e.target.value))} />
          </Field>
        </div>
        <Button className="mt-5 w-full" onClick={submit}>
          <Rocket className="h-4 w-4" /> Launch my dashboard
        </Button>
      </Card>
    </div>
  );
}

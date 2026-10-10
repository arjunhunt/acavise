import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Zap } from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input, Field } from "../components/ui/input";
import { useApp } from "../lib/useApp";
import { signupLocal, demoLogin } from "../lib/store";
import { getSB } from "../lib/supabase";
import { cloudSignup } from "../lib/cloud";
import { toast } from "../lib/toast";

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useApp();

  const submit = async () => {
    if (!name.trim()) return toast("Enter your name", "err");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return toast("Enter a valid email", "err");
    if (p1.length < 6) return toast("Password needs 6+ characters", "err");
    if (p1 !== p2) return toast("Passwords do not match", "err");
    if (getSB()) {
      setBusy(true);
      const r = await cloudSignup(email, p1, name.trim());
      setBusy(false);
      if (r.error) return toast(r.error, "err");
      refresh();
      toast("Account created — synced across devices");
      navigate("/onboarding");
      return;
    }
    const r = signupLocal(email, p1, name.trim());
    if (r.error) return toast(r.error, "err");
    refresh();
    toast("Account created — complete your profile");
    navigate("/onboarding");
  };

  const demo = () => {
    demoLogin();
    refresh();
    toast("Welcome to Demo Mode — explore freely");
    navigate("/dashboard");
  };

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <Card className="w-full max-w-md animate-fade-rise">
        <Logo />
        <h1 className="mt-4 font-display text-3xl">Start your visibility.</h1>
        <p className="mt-1 text-sm text-muted-foreground">University email plus password. No verification wait.</p>
        <Field label="Full name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arjun Singh" />
        </Field>
        <Field label="University / student email">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" type="email" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Password (min 6)">
            <Input value={p1} onChange={(e) => setP1(e.target.value)} placeholder="••••••" type="password" />
          </Field>
          <Field label="Confirm password">
            <Input
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              placeholder="••••••"
              type="password"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </Field>
        </div>
        <Button className="mt-5 w-full" onClick={submit} disabled={busy}>
          <UserPlus className="h-4 w-4" /> {busy ? "Creating…" : "Create account"}
        </Button>
        <Button variant="secondary" className="mt-2.5 w-full" onClick={demo}>
          <Zap className="h-4 w-4" /> Enter via Instant Demo Mode
        </Button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Have an account?{" "}
          <Link to="/login" className="font-bold text-foreground hover:underline">Log in</Link>
          {" • "}
          <Link to="/" className="font-bold text-foreground hover:underline">Home</Link>
        </p>
      </Card>
    </div>
  );
}

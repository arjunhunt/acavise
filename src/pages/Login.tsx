import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Zap } from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input, Field } from "../components/ui/input";
import { useApp } from "../lib/useApp";
import { loginLocal, demoLogin } from "../lib/store";
import { getSB } from "../lib/supabase";
import { cloudLogin } from "../lib/cloud";
import { toast } from "../lib/toast";

export function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useApp();

  const submit = async () => {
    if (getSB()) {
      setBusy(true);
      const r = await cloudLogin(email, pass);
      setBusy(false);
      if (r.error) return toast(r.error, "err");
      refresh();
      navigate(r.user?.onboarded ? "/dashboard" : "/onboarding");
      toast(`Welcome back, ${(r.user?.name || "student").split(" ")[0]} — progress synced`);
      return;
    }
    const r = loginLocal(email, pass);
    if (r.error) return toast(r.error, "err");
    refresh();
    navigate(r.user?.onboarded ? "/dashboard" : "/onboarding");
    toast(`Welcome back, ${(r.user?.name || "student").split(" ")[0]}`);
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
        <h1 className="mt-4 font-display text-3xl">Log in anywhere.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Phone, laptop, tablet — same credentials.</p>
        <Field label="Email">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" type="email" />
        </Field>
        <Field label="Password">
          <Input
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••"
            type="password"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>
        <Button className="mt-5 w-full" onClick={submit} disabled={busy}>
          <LogIn className="h-4 w-4" /> {busy ? "Logging in…" : "Log in"}
        </Button>
        <Button variant="secondary" className="mt-2.5 w-full" onClick={demo}>
          <Zap className="h-4 w-4" /> Instant Demo Mode
        </Button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-bold text-foreground hover:underline">Sign up</Link>
          {" • "}
          <Link to="/" className="font-bold text-foreground hover:underline">Home</Link>
        </p>
      </Card>
    </div>
  );
}

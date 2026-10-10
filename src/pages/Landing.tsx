import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { Logo } from "../components/Logo";
import { useReveal } from "../hooks/hooks";
import { useApp } from "../lib/useApp";
import { demoLogin } from "../lib/store";
import { toast } from "../lib/toast";
import { useNavigate } from "react-router-dom";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

function useDemo() {
  const navigate = useNavigate();
  const { refresh } = useApp();
  return () => {
    demoLogin();
    refresh();
    toast("Welcome to Demo Mode — explore freely");
    navigate("/dashboard");
  };
}

const QUESTIONS = [
  { n: "01", q: "“Where do I stand right now?”", a: "Real-time SGPA/CGPA, weighted attendance, internal tracking.", to: "/signup", cta: "Open Dashboard" },
  { n: "02", q: "“What do I need for my target?”", a: "Reverse math: exact SGPA plus endterm scores for your graduation goal.", to: "/signup", cta: "Open Targets" },
  { n: "03", q: "“What should I focus on first?”", a: "Priority score 1–100 from deficit, credits and attendance risk.", to: "/signup", cta: "Open Priorities" },
  { n: "04", q: "“What should I do today?”", a: "Daily time blocks tied to high-yield subjects and deadlines.", to: "/signup", cta: "Open Planner" },
];

const CAPABILITIES = [
  { t: "Academic Dashboard", d: "CGPA gap, SGPA estimate, attendance health — Safe, Warning, Critical — plus deadline countdowns and trend badges." },
  { t: "Academics Manager", d: "Semester 1–8 registry, credit sums, and an assessment inspector for internals, midsems, labs and endterms." },
  { t: "Target Simulator", d: "Required future SGPA, feasibility tiers from Achievable to Infeasible, endterm projection and a per-course grade matrix." },
  { t: "Priority Engine", d: "Rank one to N with diagnosis, prescriptive action and impact factor. Export your study brief as text." },
  { t: "Smart Planner", d: "Monday-to-Sunday board, scheduled-versus-done progress, streak tracking and check-off execution." },
  { t: "AI Assistant", d: "Grounded in your subjects, scores, attendance and targets. Prompt pills, deep links and structured answers." },
];

export function Landing() {
  const ref = useReveal();
  const demo = useDemo();
  return (
    <div ref={ref} className="min-h-screen bg-[hsl(var(--background))]">
      {/* Cinematic hero with fullscreen video */}
      <div className="relative overflow-hidden">
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src={VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        {/* Navigation */}
        <nav className="relative z-10 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
          <Link to="/" className="flex items-center gap-3" aria-label="AcaVise home">
            <Logo link={false} />
            <span className="font-display text-3xl tracking-tight text-foreground">AcaVise</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm text-foreground transition-colors">Home</Link>
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#method" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Method</a>
            <a href="#math" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Math</a>
            <Link to="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Sign in</Link>
          </div>
          <Link
            to="/signup"
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03]"
          >
            Begin Journey
          </Link>
        </nav>

        {/* Hero */}
        <section className="relative z-10 flex flex-col items-center px-6 pb-40 pt-32 text-center" style={{ paddingTop: 90, paddingBottom: 90 }}>
          <h1
            className="animate-fade-rise max-w-7xl font-normal leading-[0.95] tracking-[-2.46px] text-foreground text-5xl sm:text-7xl md:text-8xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Where <em className="not-italic text-muted-foreground">ambition</em> rises{" "}
            <em className="not-italic text-muted-foreground">through the noise.</em>
          </h1>
          <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            AcaVise turns scattered marks, attendance and credits into live SGPA, exact target
            scores, ranked priorities and a weekly plan — academic visibility for deep thinkers
            and bold builders.
          </p>
          <div className="animate-fade-rise-delay-2 mt-12 flex flex-col items-center gap-4">
            <Link
              to="/signup"
              className="liquid-glass cursor-pointer rounded-full px-14 py-5 text-base text-foreground transition-transform hover:scale-[1.03]"
            >
              Begin Journey
            </Link>
            <button
              onClick={demo}
              className="group flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Zap className="h-4 w-4" />
              Explore instantly with Demo Mode
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </div>

      {/* Four questions */}
      <section id="method" className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
        <p className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">The method</p>
        <h2 className="reveal mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
          Four questions. One quiet system of answers.
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUESTIONS.map((x) => (
            <Link
              key={x.n}
              to={x.to}
              className="reveal surface group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="font-mono text-xs text-muted-foreground">{x.n}</div>
              <h3 className="mt-3 font-display text-2xl leading-snug">{x.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{x.a}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                {x.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section id="features" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
          <p className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Capabilities</p>
          <h2 className="reveal mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Everything your semester needs, in one place.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c, i) => (
              <div key={c.t} className="reveal surface rounded-2xl p-6">
                <div className="font-mono text-xs text-muted-foreground">0{i + 1}</div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Math */}
      <section id="math" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
          <p className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">The math</p>
          <h2 className="reveal mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            No black box. Every number is explainable.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              ["Weighted SGPA", "SGPA = Σ (Score ÷ 10 × Credits) ÷ Σ Credits", "The same credit-weighting your university uses."],
              ["Required future SGPA", "Req = (Target × Total − Current × Completed) ÷ Remaining", "Reverse-engineers your graduation goal. Completed = (Sem − 1) × 20."],
              ["Priority score, 1–100", "Deficit = max(0, 100 − Score) · Priority = min(100, max(10, Deficit + Credits × 2))", "High below 65%. Medium 65–80%. Low above 80%."],
              ["Weighted attendance", "Attendance = Σ (Att × Credits) ÷ Σ Credits", "Credit-weighted, with Safe, Warning and Critical bands."],
            ].map(([t, f, d]) => (
              <div key={t} className="reveal surface rounded-2xl p-6">
                <h3 className="text-lg font-semibold tracking-tight">{t}</h3>
                <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-foreground/90">
                  {f}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center sm:px-8">
          <h2 className="reveal max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            Stop guessing. <em className="not-italic text-muted-foreground">Start simulating.</em>
          </h2>
          <p className="reveal mt-6 max-w-xl text-muted-foreground">Onboarding takes thirty seconds. Demo mode takes one click.</p>
          <div className="reveal mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="liquid-glass rounded-full px-14 py-5 text-base text-foreground transition-transform hover:scale-[1.03]"
            >
              Begin Journey
            </Link>
            <button
              onClick={demo}
              className="surface cursor-pointer rounded-full px-8 py-4 text-sm font-semibold transition hover:-translate-y-0.5"
            >
              Try the demo
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-[13px] text-muted-foreground sm:flex-row sm:px-8">
          <span>© 2026 AcaVise — Academic Visibility &amp; Progress Simulator</span>
          <span>Your data stays yours. Synced only to your account.</span>
        </div>
      </footer>
    </div>
  );
}

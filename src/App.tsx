import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp, applyTheme } from "./lib/useApp";
import { currentUser } from "./lib/store";
import { getSB } from "./lib/supabase";
import { ensureCloudUser } from "./lib/cloud";
import { Toaster } from "./lib/toast";
import { AppShell } from "./components/AppShell";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Academics } from "./pages/Academics";
import { Targets } from "./pages/Targets";
import { Priority } from "./pages/Priority";
import { Planner } from "./pages/Planner";
import { Assistant } from "./pages/Assistant";
import { Settings } from "./pages/Settings";
import { Logo } from "./components/Logo";

function BootSplash() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="surface w-full max-w-md animate-fade-rise rounded-2xl p-8 text-center">
        <div className="flex justify-center"><Logo link={false} size="lg" /></div>
        <h1 className="mt-4 font-display text-3xl">Signing you in…</h1>
        <p className="mt-1 text-sm text-muted-foreground">Syncing your academic cloud</p>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useApp();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (!user.onboarded && loc.pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;
  return children;
}

function RequireGuest({ children }: { children: JSX.Element }) {
  const { user } = useApp();
  if (user && user.onboarded) return <Navigate to="/dashboard" replace />;
  if (user && !user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("acavise_theme")) localStorage.setItem("acavise_theme", "dark");
    let cancelled = false;
    (async () => {
      const sb = getSB();
      if (sb) {
        try {
          const { data } = await sb.auth.getSession();
          if (!cancelled && data?.session) {
            try {
              await ensureCloudUser(data.session.user);
            } catch (e) {
              console.warn(e);
            }
          }
        } catch (e) {
          console.warn("cloud boot failed, local mode", e);
        }
      }
      if (!cancelled) {
        applyTheme();
        // Re-apply when route components mount with a user (theme stored per user)
        setReady(true);
      }
    })();
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const relisten = () => {
      if ((currentUser()?.theme || "dark") === "system") applyTheme();
    };
    mq.addEventListener?.("change", relisten);
    return () => {
      cancelled = true;
      mq.removeEventListener?.("change", relisten);
    };
  }, []);

  if (!ready) return <BootSplash />;

  return (
    <AppProvider>
      <HashRouter>
        <ScrollTop />
        <Toaster />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
          <Route path="/signup" element={<RequireGuest><Signup /></RequireGuest>} />
          <Route
            path="/onboarding"
            element={<RequireAuth><Onboarding /></RequireAuth>}
          />
          <Route element={<RequireAuth><AppShell /></RequireAuth>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/priority" element={<Priority />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/ai-assistant" element={<Assistant />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

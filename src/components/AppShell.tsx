import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Target, Zap, CalendarDays, Sparkles, Settings,
  Search, Bell, Menu,
} from "lucide-react";
import { useApp, applyTheme } from "../lib/useApp";
import { updateUser, getSubjects, getDeadlines } from "../lib/store";
import { signOutEverywhere } from "../lib/cloud";
import { sgpaOf } from "../lib/calc";
import { buildNotifications } from "../lib/calc";
import { toast } from "../lib/toast";
import { Logo } from "./Logo";
import { CommandPalette } from "./CommandPalette";
import { NotificationsDrawer } from "./Notifications";
import { Progress } from "./ui/progress";
import { cn } from "../lib/utils";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/academics", icon: BookOpen, label: "Academics" },
  { to: "/targets", icon: Target, label: "Target Marks" },
  { to: "/priority", icon: Zap, label: "Study Priorities" },
  { to: "/planner", icon: CalendarDays, label: "Weekly Planner" },
  { to: "/ai-assistant", icon: Sparkles, label: "AI Assistant" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const MOBILE_NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/academics", icon: BookOpen, label: "Courses" },
  { to: "/priority", icon: Zap, label: "Focus" },
  { to: "/planner", icon: CalendarDays, label: "Plan" },
  { to: "/settings", icon: Menu, label: "Menu" },
];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function AppShell() {
  const { user, refresh } = useApp();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    applyTheme();
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (!user) return null;
  const subs = getSubjects(user.id, user.sem);
  const sg = sgpaOf(subs);
  const notifs = buildNotifications(user, subs, getDeadlines(user.id));
  const pct = Math.min(100, Math.max(0, ((user.currentCgpa || 0) / (user.targetCgpa || 10)) * 100));

  const switchSem = (v: number) => {
    updateUser({ sem: v });
    refresh();
    toast(`Switched to Semester ${v}`);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 z-30 hidden h-screen w-60 shrink-0 flex-col gap-3 border-r border-border bg-[hsl(var(--surface)/0.85)] p-3.5 backdrop-blur-xl md:flex">
        <div className="px-1.5 pt-1">
          <Logo />
        </div>
        <nav className="mt-1 flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:translate-x-0.5 hover:bg-white/[0.04] hover:text-foreground",
                  isActive && "border-border bg-white/[0.07] text-foreground",
                )
              }
            >
              <span className="surface grid h-8 w-8 place-items-center rounded-[9px]">
                <n.icon className="h-4 w-4" />
              </span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="surface rounded-xl p-3 text-xs">
          <div className="font-extrabold">
            Sem {user.sem} • {user.branch.split(" ")[0]}
          </div>
          <div className="mt-1.5 flex justify-between text-muted-foreground">
            <span>SGPA</span>
            <b className="text-foreground">{sg || "—"}</b>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Target</span>
            <b className="text-foreground">{Number(user.targetCgpa).toFixed(2)}</b>
          </div>
          <Progress value={pct} className="mt-2 h-[7px]" />
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="surface mt-auto flex cursor-pointer items-center gap-2.5 rounded-xl p-2.5 text-left transition hover:border-[hsl(var(--muted-foreground)/0.4)]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-[13px] font-extrabold text-primary-foreground">
            {initials(user.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-extrabold">{user.name}</span>
            <span className="block truncate text-[11.5px] text-muted-foreground">{user.email}</span>
          </span>
        </button>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-20 flex items-center gap-2.5 border-b border-border bg-[hsl(var(--background)/0.8)] px-4 py-3 backdrop-blur-xl sm:px-6">
          <select
            value={user.sem}
            onChange={(e) => switchSem(Number(e.target.value))}
            title="Global semester switcher"
            className="surface max-w-[106px] flex-none cursor-pointer rounded-[10px] px-2 py-2 text-[13px] font-bold outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Sem {s}</option>
            ))}
          </select>
          <button
            onClick={() => setSearchOpen(true)}
            className="surface flex h-[38px] flex-1 cursor-pointer items-center gap-2 rounded-[11px] px-3 text-[13px] text-muted-foreground transition hover:text-foreground max-sm:max-w-[38px] max-sm:justify-center max-sm:px-0"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate max-sm:hidden">Search subjects, pages…</span>
            <kbd className="ml-auto hidden rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] sm:block">Ctrl K</kbd>
          </button>
          <button
            onClick={() => setNotifOpen(true)}
            title="Notifications"
            className="surface relative grid h-[38px] w-[38px] flex-none cursor-pointer place-items-center rounded-[11px] transition hover:-translate-y-px"
          >
            <Bell className="h-4 w-4" />
            {notifs.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-extrabold text-white">
                {notifs.length}
              </span>
            )}
          </button>
          <div className="relative flex-none">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              title="Profile"
              className="surface grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-[11px] text-base transition hover:-translate-y-px"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground">
                {initials(user.name)}
              </span>
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="surface-solid absolute right-0 top-12 z-50 w-64 animate-fade-rise rounded-2xl p-3.5 shadow-2xl max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-16 max-sm:w-auto">
                  <div className="font-extrabold">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  <div className="mt-2.5 text-xs text-muted-foreground">Graduation target</div>
                  <div className="font-extrabold">
                    {Number(user.currentCgpa).toFixed(2)} / {Number(user.targetCgpa).toFixed(2)} CGPA
                  </div>
                  <Progress value={pct} className="h-[7px]" />
                  <div className="mt-3 flex gap-2">
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="surface flex-1 rounded-[10px] px-3 py-2 text-center text-[13px] font-bold"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        signOutEverywhere().then(() => navigate("/"));
                      }}
                      className="flex-1 cursor-pointer rounded-[10px] bg-gradient-to-br from-rose-500 to-orange-400 px-3 py-2 text-center text-[13px] font-bold text-white"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1180px] animate-fade-rise px-4 pb-24 pt-6 sm:px-6 md:px-9">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[hsl(var(--surface)/0.94)] px-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5 gap-0.5">
          {MOBILE_NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 rounded-[10px] px-0.5 py-1.5 text-[10.5px] font-bold text-muted-foreground",
                  isActive && "text-[hsl(var(--info))]",
                )
              }
            >
              <n.icon className="h-[18px] w-[18px]" />
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}

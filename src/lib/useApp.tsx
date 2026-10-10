import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { currentUser, type User } from "./store";

interface AppCtx {
  user: User | null;
  refresh: () => void;
}

const Ctx = createContext<AppCtx>({ user: null, refresh: () => {} });

export function AppProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const user = useMemo(() => currentUser(), [tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const value = useMemo(() => ({ user, refresh }), [user, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  return useContext(Ctx);
}

export function applyTheme() {
  const u = currentUser();
  const pref = u?.theme || (localStorage.getItem("acavise_theme") as string) || "dark";
  let eff = pref;
  if (pref === "system")
    eff = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.dataset.theme = eff;
}

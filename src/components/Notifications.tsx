import { useEffect } from "react";
import { X, BellRing, AlertTriangle, Zap, PartyPopper } from "lucide-react";
import { currentUser, getSubjects, getDeadlines } from "../lib/store";
import { buildNotifications } from "../lib/calc";

const kindIcon = { exam: BellRing, att: AlertTriangle, prio: Zap } as const;

export function NotificationsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  const u = currentUser();
  const items = u ? buildNotifications(u, getSubjects(u.id, u.sem), getDeadlines(u.id)) : [];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="surface-solid ml-auto flex max-h-[84vh] w-full max-w-sm animate-fade-rise flex-col rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="font-bold">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {items.length ? `${items.length} active alert(s)` : "All clear — nice work"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="surface grid h-9 w-9 cursor-pointer place-items-center rounded-[10px]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto p-2.5">
          {items.length ? (
            items.map((n, i) => {
              const Icon = kindIcon[n.type as keyof typeof kindIcon] ?? BellRing;
              return (
                <div key={i} className="surface rounded-xl p-3 text-[13.5px] leading-relaxed">
                  <b className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 shrink-0" /> {n.title}
                  </b>
                  <div className="mt-1 text-muted-foreground">{n.desc}</div>
                </div>
              );
            })
          ) : (
            <div className="surface rounded-xl p-3 text-sm">
              <b className="flex items-center gap-1.5">
                <PartyPopper className="h-4 w-4" /> No warnings.
              </b>
              <span className="text-muted-foreground">Attendance is safe and no deadlines within 7 days.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

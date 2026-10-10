import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, CalendarDays } from "lucide-react";
import { currentUser, getAllSubjects, getDeadlines } from "../lib/store";

const PAGE_LINKS = [
  { label: "Dashboard", to: "/dashboard", sub: "Page" },
  { label: "Academics", to: "/academics", sub: "Page" },
  { label: "Target Marks", to: "/targets", sub: "Page" },
  { label: "Study Priorities", to: "/priority", sub: "Page" },
  { label: "Weekly Planner", to: "/planner", sub: "Page" },
  { label: "AI Assistant", to: "/ai-assistant", sub: "Page" },
  { label: "Settings", to: "/settings", sub: "Page" },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setQ("");
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const items = useMemo(() => {
    const query = q.toLowerCase();
    const out: { icon: "book" | "cal" | "page"; label: string; sub: string; to: string }[] = [];
    const u = currentUser();
    if (u) {
      const all = getAllSubjects(u.id);
      Object.keys(all).forEach((sem) =>
        all[sem].forEach((s) => {
          if (!query || s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query))
            out.push({ icon: "book", label: `${s.code} — ${s.name}`, sub: `Sem ${sem} • ${s.score}%`, to: "/academics" });
        }),
      );
      getDeadlines(u.id).forEach((d) => {
        if (!query || d.title.toLowerCase().includes(query))
          out.push({ icon: "cal", label: d.title, sub: `${d.date} • ${d.subjectCode}`, to: "/dashboard" });
      });
    }
    PAGE_LINKS.forEach((p) => {
      if (!query || p.label.toLowerCase().includes(query)) out.push({ icon: "page", label: p.label, sub: p.sub, to: p.to });
    });
    return out.slice(0, 12);
  }, [q]);

  if (!open) return null;
  const go = (to: string) => {
    onClose();
    navigate(to);
  };
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="surface-solid mx-auto mt-[10vh] w-full max-w-lg animate-fade-rise overflow-hidden rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subjects, pages, deadlines…"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded-md bg-white/10 px-2 py-1 font-mono text-[11px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-[340px] overflow-y-auto p-2">
          {items.length ? (
            items.map((it, i) => (
              <button
                key={i}
                onClick={() => go(it.to)}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-sm transition hover:bg-white/[0.07]"
              >
                {it.icon === "book" ? (
                  <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : it.icon === "cal" ? (
                  <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <b>{it.label}</b>
                <small className="ml-auto text-muted-foreground">{it.sub}</small>
              </button>
            ))
          ) : (
            <div className="p-5 text-sm text-muted-foreground">No matches for “{q}”.</div>
          )}
        </div>
      </div>
    </div>
  );
}

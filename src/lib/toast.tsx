import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, OctagonX } from "lucide-react";

export type ToastType = "ok" | "warn" | "err";
export interface ToastMsg {
  id: number;
  text: string;
  type: ToastType;
}

let nextId = 1;

export function toast(text: string, type: ToastType = "ok") {
  window.dispatchEvent(new CustomEvent<ToastMsg>("acavise-toast", { detail: { id: nextId++, text, type } }));
}

const icons = { ok: CheckCircle2, warn: AlertTriangle, err: OctagonX };

export function Toaster() {
  const [items, setItems] = useState<ToastMsg[]>([]);
  useEffect(() => {
    const h = (e: Event) => {
      const t = (e as CustomEvent<ToastMsg>).detail;
      setItems((xs) => [...xs.slice(-3), t]);
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== t.id)), 3400);
    };
    window.addEventListener("acavise-toast", h);
    return () => window.removeEventListener("acavise-toast", h);
  }, []);
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 max-sm:left-3 max-sm:right-3 max-sm:bottom-20">
      {items.map((t) => {
        const Icon = icons[t.type];
        const edge =
          t.type === "ok" ? "border-l-emerald-400" : t.type === "warn" ? "border-l-amber-400" : "border-l-rose-400";
        return (
          <div
            key={t.id}
            className={`surface-solid animate-fade-rise flex items-center gap-2.5 rounded-xl border-l-4 px-4 py-3 text-sm font-semibold shadow-2xl ${edge}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{t.text}</span>
          </div>
        );
      })}
    </div>
  );
}

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}

export function Dialog({ open, onClose, title, description, children, wide }: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "surface-solid animate-fade-rise max-h-[88vh] w-full overflow-y-auto rounded-2xl p-6 shadow-2xl",
          wide ? "max-w-2xl" : "max-w-lg",
        )}
        role="dialog"
        aria-label={title}
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight">{title}</h3>
            {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="surface grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-[10px] transition hover:-translate-y-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-[11px] border border-input bg-[hsl(var(--surface))] px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-white/60 focus:ring-2 focus:ring-white/15",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-[11px] border border-input bg-[hsl(var(--surface))] px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-white/60 focus:ring-2 focus:ring-white/15",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "cursor-pointer rounded-[10px] border border-input bg-[hsl(var(--surface))] px-3 py-2 text-[13px] font-bold text-foreground outline-none transition focus:border-white/60",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 mt-3 block text-xs font-bold tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

export { Input, Textarea, Select, Field };

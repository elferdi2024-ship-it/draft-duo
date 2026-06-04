import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("glass v-stack rounded-lg p-4", className)}>{children}</section>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "blue" | "gold" | "red" | "green" }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded border px-2 text-[11px] font-semibold uppercase tracking-[0.12em]",
        tone === "neutral" && "border-slate-600/60 bg-slate-800/60 text-slate-200",
        tone === "blue" && "border-sky-400/40 bg-sky-400/10 text-sky-200",
        tone === "gold" && "border-amber-300/50 bg-amber-300/10 text-amber-100",
        tone === "red" && "border-rose-300/40 bg-rose-400/10 text-rose-100",
        tone === "green" && "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
      )}
    >
      {children}
    </span>
  );
}

export function Meter({ value, tone = "blue" }: { value: number; tone?: "blue" | "gold" | "red" | "green" }) {
  return (
    <div className="h-2 overflow-hidden rounded bg-slate-800">
      <div
        className={cn(
          "h-full rounded transition-all duration-300",
          tone === "blue" && "bg-sky-400",
          tone === "gold" && "bg-amber-300",
          tone === "red" && "bg-rose-400",
          tone === "green" && "bg-emerald-400",
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

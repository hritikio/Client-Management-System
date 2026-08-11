import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: "brand" | "brass" | "danger";
}) {
  const accentColor =
    accent === "brass" ? "text-brass" : accent === "danger" ? "text-danger" : "text-brand";

  return (
    <div className="rounded-lg border border-line bg-surface px-5 py-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">
          {label}
        </p>
        <Icon className={cn("h-4 w-4", accentColor)} />
      </div>
      <p className="mt-2.5 font-display text-[30px] font-medium leading-none text-ink">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-[12.5px] text-ink-faint">{hint}</p>}
    </div>
  );
}

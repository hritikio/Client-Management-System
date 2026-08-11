import { cn } from "@/lib/utils";
import { STATUS_META, statusColorVar } from "@/lib/status";
import type { ClientStatus } from "@/lib/types";

export function StatusBadge({
  status,
  size = "md",
}: {
  status: ClientStatus;
  size?: "sm" | "md";
}) {
  const color = statusColorVar(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]"
      )}
      style={{
        color: `var(--color-${color})`,
        borderColor: `color-mix(in srgb, var(--color-${color}) 35%, transparent)`,
        background: `var(--color-${color}-soft)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: `var(--color-${color})` }}
      />
      {STATUS_META[status].label}
    </span>
  );
}

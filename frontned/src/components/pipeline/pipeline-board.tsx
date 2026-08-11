import Link from "next/link";
import { STATUS_ORDER, STATUS_META, statusColorVar } from "@/lib/status";
import type { ClientStatus } from "@/lib/types";

export function PipelineBoard({
  counts,
  total,
}: {
  counts: Partial<Record<ClientStatus, number>>;
  total: number;
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-line border-t border-line sm:grid-cols-5">
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status];
        const color = statusColorVar(status);
        const count = counts[status] ?? 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <Link
            key={status}
            href={`/clients?status=${status}`}
            className="group flex flex-col gap-3 px-5 py-5 transition-colors hover:bg-paper"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: `var(--color-${color})` }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                {meta.short} · {meta.label}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <span className="font-display text-[28px] font-medium leading-none text-ink">
                {count}
              </span>
              <span className="font-mono text-[11px] text-ink-faint">{pct}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `var(--color-${color})` }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

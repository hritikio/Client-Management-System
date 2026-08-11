"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { STATUS_ORDER, STATUS_META, statusColorVar, nextValidStatuses } from "@/lib/status";
import type { ClientStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The pipeline rail: every client is a train of one, moving along a fixed
 * five-station track. Filled stations are visited, the ringed station is
 * current, and only stations reachable by a valid transition are clickable.
 */
export function PipelineRail({
  current,
  onAdvance,
  disabled,
}: {
  current: ClientStatus;
  onAdvance?: (status: ClientStatus) => Promise<void>;
  disabled?: boolean;
}) {
  const [pending, setPending] = useState<ClientStatus | null>(null);
  const currentIndex = STATUS_ORDER.indexOf(current);
  const reachable = nextValidStatuses(current);

  const handleClick = async (status: ClientStatus) => {
    if (!onAdvance || disabled || pending) return;
    if (!reachable.includes(status)) return;
    setPending(status);
    try {
      await onAdvance(status);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative flex min-w-[560px] items-start pt-2">
        {/* base line */}
        <div className="absolute left-[5%] right-[5%] top-[19px] h-[2px] bg-line-strong" />
        {/* filled progress line */}
        <div
          className="absolute left-[5%] top-[19px] h-[2px] origin-left bg-black transition-all duration-500 ease-out"
          style={{
            width: `${(currentIndex / (STATUS_ORDER.length - 1)) * 90}%`,
          }}
        />

        {STATUS_ORDER.map((status, i) => {
          const meta = STATUS_META[status];
          const color = statusColorVar(status);
          const isPast = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isReachable = reachable.includes(status) && !isCurrent;
          const isPending = pending === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() => handleClick(status)}
              disabled={!isReachable || disabled || !!pending}
              className={cn(
                "group relative z-10 flex flex-1 flex-col items-center gap-2.5 py-0",
                isReachable && !disabled && "cursor-pointer",
                (!isReachable || disabled) && "cursor-default"
              )}
              title={isReachable ? `Move to ${meta.label}` : meta.label}
            >
             <span
                className={cn(
                  "flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 bg-paper transition-all duration-200",
                  isCurrent && "scale-110 shadow-[0_0_0_4px_var(--ring-color)]",
                  isReachable && "group-hover:scale-105 group-hover:border-ink"
                )}
                style={{
                  borderColor: isPast ? "var(--color-brand)" : isCurrent ? `var(--color-${color})` : "var(--color-line-strong)",
                  background: isPast ? "var(--color-brand)" : isCurrent ? "var(--color-surface)" : "var(--color-paper)",
                  ["--ring-color" as string]: `color-mix(in srgb, var(--color-${color}) 20%, transparent)`,
                }}
              >
              
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" style={{ color: `var(--color-${color})` }} />
                ) : isPast ? (
                  <Check className="h-3 w-3 text-surface" strokeWidth={3} />
                ) : isCurrent ? (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: `var(--color-${color})` }}
                  />
                ) : null}
              </span>
              <span className="flex flex-col items-center gap-0.5">
                <span
                  className={cn(
                    "font-mono text-[10px] tracking-[0.1em]",
                    isCurrent ? "text-ink" : "text-ink-faint"
                  )}
                >
                  {meta.short}
                </span>
                <span
                  className={cn(
                    "text-[12.5px] font-medium leading-none",
                    isCurrent ? "text-ink" : isPast ? "text-ink-soft" : "text-ink-faint",
                    isReachable && "group-hover:text-ink group-hover:underline underline-offset-4"
                  )}
                >
                  {meta.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

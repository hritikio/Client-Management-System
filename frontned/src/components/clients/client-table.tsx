import Link from "next/link";
import { Building2 } from "lucide-react";
import type { ClientRecord } from "@/lib/types";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, initials } from "@/lib/utils";
import { STATUS_ORDER, statusColorVar } from "@/lib/status";

export function ClientTable({ clients }: { clients: ClientRecord[] }) {
  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No clients found"
        description="Try a different filter, or add a new client to get started."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            <th className="px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-faint">
              Client
            </th>
            <th className="px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-faint">
              Status
            </th>
            <th className="px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-faint">
              Progress
            </th>
            <th className="px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-faint">
              Assigned to
            </th>
            <th className="px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-faint">
              Added
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {clients.map((c) => {
            const idx = STATUS_ORDER.indexOf(c.status);
            return (
              <tr key={c.id} className="group transition-colors hover:bg-paper">
                <td className="px-5 py-3.5">
                  <Link href={`/clients/${c.id}`} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-[11px] font-medium text-brand-ink">
                      {initials(c.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-ink group-hover:underline">
                        {c.name}
                      </p>
                      <p className="truncate text-[12px] text-ink-faint">
                        {c.company || c.email}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={c.status} size="sm" />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    {STATUS_ORDER.map((s, i) => (
                      <span
                        key={s}
                        className="h-1.5 w-4 rounded-full"
                        style={{
                          background:
                            i <= idx
                              ? `var(--color-${statusColorVar(c.status)})`
                              : "var(--color-line)",
                        }}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[13px] text-ink-soft">
                    {c.assignedTo?.name ?? "Unassigned"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-mono text-[12px] text-ink-faint">
                    {formatDate(c.createdAt)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

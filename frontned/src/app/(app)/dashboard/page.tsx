"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, TrendingUp, AlertTriangle, Activity, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getDashboard } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { StatCard } from "@/components/dashboard/stat-card";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, timeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getDashboard(token)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading || !stats) return <PageLoading />;

  const firstName = user?.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-1 font-display text-[28px] font-medium text-ink">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-[13.5px] text-ink-faint">
          {user?.role === "ADMIN"
            ? "Here's how the full pipeline is moving."
            : "Here's what's on your desk today."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total Clients"
          value={stats.totalClients}
          hint={user?.role === "ADMIN" ? "Across the workspace" : "Assigned to you"}
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion"
          value={`${stats.conversionRate}%`}
          hint="Active or closed"
          accent="brand"
        />
        <StatCard
          icon={AlertTriangle}
          label="On Hold"
          value={stats.statusCounts.ON_HOLD ?? 0}
          hint="Needs attention"
          accent="danger"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <CardHeader eyebrow="Manifest" title="Pipeline overview" />
        <PipelineBoard counts={stats.statusCounts} total={stats.totalClients} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader
            eyebrow="Latest entries"
            title="Recent clients"
            action={
              <Link
                href="/clients"
                className="flex items-center gap-1 text-[12.5px] font-medium text-brand hover:underline"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          />
          {stats.recentClients.length === 0 ? (
            <EmptyState icon={Users} title="No clients yet" description="New clients will show up here." />
          ) : (
            <ul className="divide-y divide-line">
              {stats.recentClients.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/clients/${c.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-paper"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-ink">{c.name}</p>
                      <p className="truncate text-[12px] text-ink-faint">
                        {c.company || "No company listed"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={c.status} size="sm" />
                      <span className="font-mono text-[10.5px] text-ink-faint">
                        {formatDate(c.createdAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <CardHeader eyebrow="Activity log" title="Recent activity" />
          {stats.recentActivity.length === 0 ? (
            <EmptyState icon={Activity} title="No activity yet" description="Notes and status changes will show up here." />
          ) : (
            <ul className="divide-y divide-line">
              {stats.recentActivity.map((n) => (
                <li key={n.id} className="px-5 py-3.5">
                  <p className="text-[13px] leading-relaxed text-ink-soft">
                    <span className="font-medium text-ink">{n.author.name}</span> on{" "}
                    <span className="font-medium text-ink">{n.client.name}</span>
                  </p>
                  <p className="mt-0.5 text-[13px] text-ink-faint line-clamp-2">{n.content}</p>
                  <p className="mt-1 font-mono text-[10.5px] text-ink-faint">
                    {timeAgo(n.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {user?.role === "ADMIN" && stats.byStaff.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Ownership" title="Clients by staff" />
          <ul className="divide-y divide-line">
            {stats.byStaff
              .slice()
              .sort((a, b) => b.clientCount - a.clientCount)
              .map((s) => {
                const max = Math.max(...stats.byStaff.map((x) => x.clientCount), 1);
                const pct = (s.clientCount / max) * 100;
                return (
                  <li key={s.staffId} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="w-28 shrink-0 truncate text-[13px] font-medium text-ink">
                      {s.staffName}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right font-mono text-[12.5px] text-ink-faint">
                      {s.clientCount}
                    </span>
                  </li>
                );
              })}
          </ul>
        </Card>
      )}
    </div>
  );
}

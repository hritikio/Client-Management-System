"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getUsers } from "@/lib/api";
import type { User } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, initials } from "@/lib/utils";

export default function UsersPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    getUsers(token)
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [token, user]);

  if (user?.role !== "ADMIN") return <PageLoading />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
            Workspace
          </p>
          <h1 className="mt-1 font-display text-[26px] font-medium text-ink">Team</h1>
        </div>
        <Link href="/users/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add staff
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        {loading ? (
          <PageLoading />
        ) : users.length === 0 ? (
          <EmptyState icon={UserRound} title="No team members" description="Add staff to start assigning clients." />
        ) : (
          <ul className="divide-y divide-line">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3.5 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-[12px] font-medium text-brand-ink">
                  {initials(u.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink">{u.name}</p>
                  <p className="truncate text-[12px] text-ink-faint">{u.email}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {u.role === "ADMIN" && <ShieldCheck className="h-3.5 w-3.5 text-brass" />}
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                    {u.role}
                  </span>
                </div>
                {u.createdAt && (
                  <span className="hidden font-mono text-[11px] text-ink-faint sm:block">
                    Joined {formatDate(u.createdAt)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

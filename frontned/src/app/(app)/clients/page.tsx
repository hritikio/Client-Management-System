"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getClients } from "@/lib/api";
import type { ClientRecord, ClientStatus } from "@/lib/types";
import { STATUS_ORDER, STATUS_META } from "@/lib/status";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ClientTable } from "@/components/clients/client-table";
import { PageLoading } from "@/components/ui/spinner";

export default function ClientsPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const status = (searchParams.get("status") as ClientStatus | null) ?? "";

  const fetchClients = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getClients(token, {
        status: status || undefined,
        search: search || undefined,
      });
      setClients(data);
    } finally {
      setLoading(false);
    }
  }, [token, status, search]);

  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/clients?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
            {user?.role === "ADMIN" ? "All records" : "Assigned to you"}
          </p>
          <h1 className="mt-1 font-display text-[26px] font-medium text-ink">Clients</h1>
        </div>
        <Link href="/clients/new">
          <Button>
            <Plus className="h-4 w-4" />
            New client
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, or email"
            className="pl-9"
          />
        </form>
        <Select
          value={status}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="sm:w-56"
        >
          <option value="">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </Select>
      </div>

      <Card className="overflow-hidden p-0">
        {loading ? <PageLoading /> : <ClientTable clients={clients} />}
      </Card>
    </div>
  );
}

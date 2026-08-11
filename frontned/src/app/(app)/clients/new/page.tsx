"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient, getUsers } from "@/lib/api";
import type { User } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/card";
import { ClientForm, type ClientFormValues } from "@/components/clients/client-form";
import { useToast } from "@/components/ui/toast";

export default function NewClientPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const { show } = useToast();
  const [staff, setStaff] = useState<User[]>([]);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    getUsers(token).then((users) => setStaff(users.filter((u) => u.role === "STAFF")));
  }, [token, user]);

  const handleSubmit = async (values: ClientFormValues) => {
    if (!token) return;
    const created = await createClient(token, {
      name: values.name,
      email: values.email,
      company: values.company || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      source: values.source || undefined,
      assignedToId: values.assignedToId || undefined,
    });
    show("Client added to the pipeline.");
    router.push(`/clients/${created.id}`);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href="/clients" className="flex w-fit items-center gap-1.5 text-[13px] text-ink-faint hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to clients
      </Link>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">New entry</p>
        <h1 className="mt-1 font-display text-[26px] font-medium text-ink">Add a client</h1>
        <p className="mt-1 text-[13.5px] text-ink-faint">
          New clients enter the pipeline at the Lead station.
        </p>
      </div>

      <Card>
        <CardHeader eyebrow="Details" title="Client information" />
        <div className="px-5 py-5">
          <ClientForm
            submitLabel="Add client"
            onSubmit={handleSubmit}
            showAssign={user?.role === "ADMIN"}
            staffOptions={staff}
          />
        </div>
      </Card>
    </div>
  );
}

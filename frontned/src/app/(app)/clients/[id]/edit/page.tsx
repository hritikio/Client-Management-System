"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getClient, updateClient } from "@/lib/api";
import type { ClientRecord } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/card";
import { ClientForm, type ClientFormValues } from "@/components/clients/client-form";
import { PageLoading } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const { show } = useToast();
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    getClient(token, id)
      .then(setClient)
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (values: ClientFormValues) => {
    if (!token || !id) return;
    await updateClient(token, id, {
      name: values.name,
      email: values.email,
      company: values.company || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      source: values.source || undefined,
    });
    show("Client details updated.");
    router.push(`/clients/${id}`);
  };

  if (loading || !client) return <PageLoading />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href={`/clients/${id}`}
        className="flex w-fit items-center gap-1.5 text-[13px] text-ink-faint hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to client
      </Link>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">Editing</p>
        <h1 className="mt-1 font-display text-[26px] font-medium text-ink">{client.name}</h1>
      </div>

      <Card>
        <CardHeader eyebrow="Details" title="Client information" />
        <div className="px-5 py-5">
          <ClientForm initial={client} submitLabel="Save changes" onSubmit={handleSubmit} />
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Tag, Pencil, Trash2, UserCog } from "lucide-react";
import { useAuth, ApiError } from "@/lib/auth-context";
import {
  getClient,
  updateClientStatus,
  createNote,
  deleteClient,
  getUsers,
  updateClient,
} from "@/lib/api";
import type { ClientRecord, ClientStatus, User } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PipelineRail } from "@/components/pipeline/pipeline-rail";
import { NotesPanel } from "@/components/clients/notes-panel";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { PageLoading } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const router = useRouter();
  const { show } = useToast();

  const [client, setClient] = useState<ClientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<User[]>([]);
  const [reassigning, setReassigning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) return;
    const data = await getClient(token, id);
    setClient(data);
  }, [token, id]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    getUsers(token).then((users) => setStaff(users.filter((u) => u.role === "STAFF")));
  }, [token, user]);

  const handleAdvance = async (status: ClientStatus) => {
    if (!token || !id) return;
    try {
      const updated = await updateClientStatus(token, id, status);
      setClient((c) => (c ? { ...c, status: updated.status } : c));
      show(`Moved to ${status.replace("_", " ").toLowerCase()}.`);
      load();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Could not update status.", "error");
    }
  };

  const handleAddNote = async (content: string) => {
    if (!token || !id) return;
    try {
      await createNote(token, id, content);
      show("Note added.");
      load();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Could not add note.", "error");
    }
  };

  const handleReassign = async (staffId: string) => {
    if (!token || !id) return;
    setReassigning(true);
    try {
      await updateClient(token, id, { assignedToId: staffId || null } as never);
      show("Client reassigned.");
      load();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Could not reassign client.", "error");
    } finally {
      setReassigning(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !id) return;
    setDeleting(true);
    try {
      await deleteClient(token, id);
      show("Client deleted.");
      router.push("/clients");
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Could not delete client.", "error");
      setDeleting(false);
    }
  };

  if (loading || !client) return <PageLoading />;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/clients" className="flex w-fit items-center gap-1.5 text-[13px] text-ink-faint hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to clients
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[28px] font-medium text-ink">{client.name}</h1>
            <StatusBadge status={client.status} />
          </div>
          <p className="mt-1 text-[13.5px] text-ink-faint">
            {client.company || "No company listed"} · Added {formatDate(client.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          {user?.role === "ADMIN" &&
            (confirmDelete ? (
              <div className="flex gap-2">
                <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
                  Confirm delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            ))}
        </div>
      </div>

      <Card className="p-5">
        <p className="mb-5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">
          Pipeline status
        </p>
        <PipelineRail current={client.status} onAdvance={handleAdvance} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardHeader eyebrow="Contact" title="Details" />
            <ul className="flex flex-col gap-3.5 px-5 py-4">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                <span className="break-all text-[13.5px] text-ink-soft">{client.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                <span className="text-[13.5px] text-ink-soft">{client.phone || "Not provided"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                <span className="text-[13.5px] text-ink-soft">{client.address || "Not provided"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                <span className="text-[13.5px] text-ink-soft">{client.source || "Unknown source"}</span>
              </li>
            </ul>
          </Card>

          <Card>
            <CardHeader eyebrow="Ownership" title="Assigned to" />
            <div className="px-5 py-4">
              {user?.role === "ADMIN" ? (
                <div className="flex flex-col gap-2.5">
                  <Select
                    value={client.assignedToId ?? ""}
                    disabled={reassigning}
                    onChange={(e) => handleReassign(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                  <p className="flex items-center gap-1.5 text-[12px] text-ink-faint">
                    <UserCog className="h-3.5 w-3.5" />
                    Only admins can reassign clients
                  </p>
                </div>
              ) : (
                <p className="text-[13.5px] text-ink-soft">
                  {client.assignedTo?.name ?? "Unassigned"}
                </p>
              )}
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader eyebrow={`${client.notes?.length ?? 0} entries`} title="Activity" />
          <NotesPanel notes={client.notes ?? []} onAdd={handleAddNote} />
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field, Select, Textarea } from "@/components/ui/input";
import type { ClientRecord, User } from "@/lib/types";
import { ApiError } from "@/lib/auth-context";

export interface ClientFormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  source: string;
  assignedToId: string;
}

const SOURCES = ["Referral", "Website", "Cold Call", "Social Media", "Event", "Other"];

export function ClientForm({
  initial,
  staffOptions,
  showAssign,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<ClientRecord>;
  staffOptions?: User[];
  showAssign?: boolean;
  submitLabel: string;
  onSubmit: (values: ClientFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<ClientFormValues>({
    name: initial?.name ?? "",
    company: initial?.company ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
    source: initial?.source ?? "",
    assignedToId: initial?.assignedToId ?? "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof ClientFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details) {
          const map: Record<string, string> = {};
          err.details.forEach((d) => (map[d.path] = d.message));
          setFieldErrors(map);
        }
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required error={fieldErrors.name}>
          <Input id="name" required value={values.name} onChange={set("name")} placeholder="Aarav Enterprises" />
        </Field>
        <Field label="Company" htmlFor="company" error={fieldErrors.company}>
          <Input id="company" value={values.company} onChange={set("company")} placeholder="Aarav Textiles Pvt Ltd" />
        </Field>
        <Field label="Email" htmlFor="email" required error={fieldErrors.email}>
          <Input
            id="email"
            type="email"
            required
            value={values.email}
            onChange={set("email")}
            placeholder="contact@company.com"
          />
        </Field>
        <Field label="Phone" htmlFor="phone" error={fieldErrors.phone}>
          <Input id="phone" value={values.phone} onChange={set("phone")} placeholder="9876543210" />
        </Field>
        <Field label="Source" htmlFor="source" error={fieldErrors.source}>
          <Select id="source" value={values.source} onChange={set("source")}>
            <option value="">Select source</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        {showAssign && staffOptions && (
          <Field label="Assign to" htmlFor="assignedToId">
            <Select id="assignedToId" value={values.assignedToId} onChange={set("assignedToId")}>
              <option value="">Unassigned</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      <Field label="Address" htmlFor="address" error={fieldErrors.address}>
        <Textarea
          id="address"
          rows={2}
          value={values.address}
          onChange={set("address")}
          placeholder="Street, city, state"
        />
      </Field>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2.5">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
          <p className="text-[13px] text-danger">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

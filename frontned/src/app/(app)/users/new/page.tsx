"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth, ApiError } from "@/lib/auth-context";
import { registerUser } from "@/lib/api";
import type { Role } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field, Select } from "@/components/ui/input";
import { PageLoading } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

export default function NewUserPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const { show } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STAFF");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.replace("/dashboard");
  }, [user, router]);

  if (user?.role !== "ADMIN") return <PageLoading />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    setSubmitting(true);
    try {
      await registerUser(token, { name, email, password, role });
      show("Team member added.");
      router.push("/users");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link href="/users" className="flex w-fit items-center gap-1.5 text-[13px] text-ink-faint hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to team
      </Link>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">New account</p>
        <h1 className="mt-1 font-display text-[26px] font-medium text-ink">Add a team member</h1>
      </div>

      <Card>
        <CardHeader eyebrow="Credentials" title="Account details" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
          <Field label="Full name" htmlFor="name" required>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" />
          </Field>
          <Field label="Email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@cms.com"
            />
          </Field>
          <Field label="Temporary password" htmlFor="password" required>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </Field>
          <Field label="Role" htmlFor="role" required>
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </Field>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2.5">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
              <p className="text-[13px] text-danger">{error}</p>
            </div>
          )}

          <div className="flex justify-end border-t border-line pt-5">
            <Button type="submit" loading={submitting}>
              Create account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

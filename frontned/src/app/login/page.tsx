"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useAuth, ApiError } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { PipelineRail } from "@/components/pipeline/pipeline-rail";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Hero panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink px-12 py-12 text-paper lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-paper/20 bg-paper/5">
            <span className="font-display text-[15px] font-semibold text-brass">L</span>
          </div>
          <div>
            <p className="font-display text-[15px] font-medium leading-tight">Ledger</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/40">
              Client System
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brass">
            Nexoraa Technosolve — Assessment Build
          </p>
          <h1 className="mt-4 font-display text-[38px] font-medium leading-[1.1] text-paper">
            Every client, on one visible track.
          </h1>
          <p className="mt-4 text-[14.5px] leading-relaxed text-paper/60">
            Ledger replaces scattered spreadsheets with a single pipeline —
            from first contact through close, with ownership and history
            recorded at every station.
          </p>
        </div>

        <div className="rounded-lg border border-paper/10 bg-paper/[0.04] p-5">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.12em] text-paper/40">
            The pipeline
          </p>
          <div className="[&_span]:text-paper/70">
            <PipelineRail current="ACTIVE" disabled />
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink">
              <span className="font-display text-[16px] font-semibold text-brass">L</span>
            </div>
            <span className="font-display text-[17px] font-medium text-ink">Ledger</span>
          </div>

          <h2 className="font-display text-[22px] font-medium text-ink">Sign in</h2>
          <p className="mt-1 text-[13.5px] text-ink-faint">
            Use your assigned workspace credentials.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            <Field label="Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cms.com"
              />
            </Field>

            <Field label="Password" htmlFor="password" required>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2.5">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}

            <Button type="submit" loading={submitting} className="mt-1 w-full">
              Sign in
            </Button>
          </form>

          <div className="mt-8 rounded-md border border-line bg-surface px-4 py-3.5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">
              Demo credentials
            </p>
            <div className="mt-2 space-y-1 font-mono text-[12px] text-ink-soft">
              <p>admin@cms.com · admin123</p>
              <p>priya@cms.com · staff123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

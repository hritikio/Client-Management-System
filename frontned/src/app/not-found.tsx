import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface">
        <Compass className="h-5 w-5 text-ink-faint" />
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">404</p>
        <h1 className="mt-1 font-display text-[24px] font-medium text-ink">Off the pipeline</h1>
        <p className="mt-1 text-[13.5px] text-ink-faint">This page doesn&apos;t exist.</p>
      </div>
      <Link
        href="/dashboard"
        className="rounded-md border border-ink bg-ink px-4 py-2 text-[13px] font-medium text-paper hover:bg-brand-ink"
      >
        Back to dashboard
      </Link>
    </div>
  );
}

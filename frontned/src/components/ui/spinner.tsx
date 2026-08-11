import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={className ?? "h-4 w-4 animate-spin text-ink-faint"} />;
}

export function PageLoading() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3">
      <Spinner className="h-5 w-5 animate-spin text-brand" />
      <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-faint">
        Loading
      </p>
    </div>
  );
}

import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-line bg-surface", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line px-5 py-4">
      <div>
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[17px] font-medium text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

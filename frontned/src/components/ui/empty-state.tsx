import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-paper border border-line">
        <Icon className="h-5 w-5 text-ink-faint" />
      </div>
      <div>
        <p className="font-display text-[16px] font-medium text-ink">{title}</p>
        <p className="mt-1 text-[13px] text-ink-faint">{description}</p>
      </div>
      {action}
    </div>
  );
}

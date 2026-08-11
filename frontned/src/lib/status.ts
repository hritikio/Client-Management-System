import type { ClientStatus } from "./types";

export const STATUS_ORDER: ClientStatus[] = [
  "LEAD",
  "ONBOARDING",
  "ACTIVE",
  "ON_HOLD",
  "CLOSED",
];

export const STATUS_META: Record<
  ClientStatus,
  { label: string; short: string; description: string }
> = {
  LEAD: { label: "Lead", short: "01", description: "Not yet qualified" },
  ONBOARDING: { label: "Onboarding", short: "02", description: "Being set up" },
  ACTIVE: { label: "Active", short: "03", description: "Live and running" },
  ON_HOLD: { label: "On Hold", short: "04", description: "Paused, needs attention" },
  CLOSED: { label: "Closed", short: "05", description: "Engagement ended" },
};

// Mirrors src/lib/validators.ts on the backend — kept in sync so the UI never
// offers a transition the API will reject.
const ALLOWED_TRANSITIONS: Record<ClientStatus, ClientStatus[]> = {
  LEAD: ["ONBOARDING", "CLOSED"],
  ONBOARDING: ["ACTIVE", "ON_HOLD", "CLOSED"],
  ACTIVE: ["ON_HOLD", "CLOSED"],
  ON_HOLD: ["ACTIVE", "CLOSED"],
  CLOSED: [],
};

export function isValidTransition(from: ClientStatus, to: ClientStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function nextValidStatuses(from: ClientStatus): ClientStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

export function statusColorVar(status: ClientStatus): string {
  const map: Record<ClientStatus, string> = {
    LEAD: "status-lead",
    ONBOARDING: "status-onboarding",
    ACTIVE: "status-active",
    ON_HOLD: "status-hold",
    CLOSED: "status-closed",
  };
  return map[status];
}

import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  source: z.string().optional(),
  status: z
    .enum(["LEAD", "ONBOARDING", "ACTIVE", "ON_HOLD", "CLOSED"])
    .optional(),
  assignedToId: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum(["LEAD", "ONBOARDING", "ACTIVE", "ON_HOLD", "CLOSED"]),
});

export const createNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
});

// Enforces a sane pipeline: prevents illegal status jumps (e.g. LEAD -> CLOSED directly)
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  LEAD: ["ONBOARDING", "CLOSED"],
  ONBOARDING: ["ACTIVE", "ON_HOLD", "CLOSED"],
  ACTIVE: ["ON_HOLD", "CLOSED"],
  ON_HOLD: ["ACTIVE", "CLOSED"],
  CLOSED: [],
};

export function isValidTransition(from: string, to: string): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

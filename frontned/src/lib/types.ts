export type Role = "ADMIN" | "STAFF";

export type ClientStatus = "LEAD" | "ONBOARDING" | "ACTIVE" | "ON_HOLD" | "CLOSED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  source: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
  assignedToId: string | null;
  assignedTo: { id: string; name: string; email: string } | null;
  notes?: Note[];
  _count?: { notes: number };
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  clientId?: string;
  authorId?: string;
  author: { id: string; name: string };
}

export interface DashboardStats {
  totalClients: number;
  statusCounts: Partial<Record<ClientStatus, number>>;
  conversionRate: number;
  byStaff: { staffId: string; staffName: string; clientCount: number }[];
  recentClients: {
    id: string;
    name: string;
    company: string | null;
    status: ClientStatus;
    createdAt: string;
  }[];
  recentActivity: {
    id: string;
    content: string;
    createdAt: string;
    author: { name: string };
    client: { name: string };
  }[];
}

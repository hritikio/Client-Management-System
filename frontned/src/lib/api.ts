import type { ClientRecord, ClientStatus, DashboardStats, Note, Role, User } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  details?: { path: string; message: string }[];
  constructor(message: string, status: number, details?: { path: string; message: string }[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(
      body?.error || `Request failed with status ${res.status}`,
      res.status,
      body?.details
    );
  }

  return body as T;
}

// ---- Auth ----

export function login(email: string, password: string) {
  return request<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerUser(
  token: string,
  data: { name: string; email: string; password: string; role: Role }
) {
  return request<{ token: string; user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export function getMe(token: string) {
  return request<User>("/auth/me", { token });
}

// ---- Dashboard ----

export function getDashboard(token: string) {
  return request<DashboardStats>("/dashboard", { token });
}

// ---- Clients ----

export function getClients(
  token: string,
  params?: { status?: string; search?: string }
) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.search) qs.set("search", params.search);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return request<ClientRecord[]>(`/clients${suffix}`, { token });
}

export function getClient(token: string, id: string) {
  return request<ClientRecord>(`/clients/${id}`, { token });
}

export function createClient(
  token: string,
  data: Partial<ClientRecord> & { name: string; email: string }
) {
  return request<ClientRecord>("/clients", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export function updateClient(token: string, id: string, data: Partial<ClientRecord>) {
  return request<ClientRecord>(`/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

export function updateClientStatus(token: string, id: string, status: ClientStatus) {
  return request<ClientRecord>(`/clients/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    token,
  });
}

export function deleteClient(token: string, id: string) {
  return request<void>(`/clients/${id}`, { method: "DELETE", token });
}

// ---- Notes ----

export function getNotes(token: string, clientId: string) {
  return request<Note[]>(`/clients/${clientId}/notes`, { token });
}

export function createNote(token: string, clientId: string, content: string) {
  return request<Note>(`/clients/${clientId}/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
    token,
  });
}

// ---- Users ----

export function getUsers(token: string) {
  return request<User[]>("/users", { token });
}

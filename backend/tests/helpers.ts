import request from "supertest";
import { app } from "../src/app";

export { request, app };

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}@cms.test`;
}

export async function registerUser(role: "ADMIN" | "STAFF", namePrefix = "Test User") {
  const email = uniqueEmail(role.toLowerCase());
  const res = await request(app).post("/api/auth/register").send({
    name: `${namePrefix} ${role}`,
    email,
    password: "testpass123",
    role,
  });
  return {
    token: res.body.token as string,
    user: res.body.user as { id: string; name: string; email: string; role: string },
    email,
  };
}

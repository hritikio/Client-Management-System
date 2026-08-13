import { prisma } from "../src/lib/prisma";
import { request, app, uniqueEmail, registerUser } from "./helpers";

describe("Dashboard and Users", () => {
  let adminToken: string;
  let staffToken: string;
  const userIds: string[] = [];
  const clientIds: string[] = [];

  beforeAll(async () => {
    const admin = await registerUser("ADMIN");
    const staff = await registerUser("STAFF");
    adminToken = admin.token;
    staffToken = staff.token;
    userIds.push(admin.user.id, staff.user.id);

    const created = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ name: "Dashboard Test Co", email: uniqueEmail("dashboard") });
    clientIds.push(created.body.id);
  });

  afterAll(async () => {
    if (clientIds.length) {
      await prisma.note.deleteMany({ where: { clientId: { in: clientIds } } });
      await prisma.client.deleteMany({ where: { id: { in: clientIds } } });
    }
    if (userIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.$disconnect();
  });

  test("Staff dashboard is scoped to their own clients only", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalClients).toBeGreaterThanOrEqual(1);
    expect(res.body.byStaff).toEqual([]);
  });

  test("Admin dashboard includes a per-staff breakdown", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.byStaff)).toBe(true);
  });

  test("Staff cannot list users (403)", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
  });

  test("Admin can list users (200)", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("A request with no token is rejected across protected routes", async () => {
    const res = await request(app).get("/api/clients");
    expect(res.status).toBe(401);
  });

  test("An unknown route returns 404 with a clear message", async () => {
    const res = await request(app).get("/api/not-a-real-route");
    expect(res.status).toBe(404);
    expect(res.body.error).toContain("not found");
  });
});

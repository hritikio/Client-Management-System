import { prisma } from "../src/lib/prisma";
import { request, app, uniqueEmail } from "./helpers";

describe("Auth", () => {
  const createdUserIds: string[] = [];

  afterAll(async () => {
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.$disconnect();
  });

  test("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("POST /api/auth/register creates a user and returns a token", async () => {
    const email = uniqueEmail("register");
    const res = await request(app).post("/api/auth/register").send({
      name: "Test Register",
      email,
      password: "testpass123",
      role: "STAFF",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.password).toBeUndefined();

    createdUserIds.push(res.body.user.id);
  });

  test("POST /api/auth/register rejects a duplicate email with 409", async () => {
    const email = uniqueEmail("dupe");
    const first = await request(app).post("/api/auth/register").send({
      name: "First",
      email,
      password: "testpass123",
    });
    createdUserIds.push(first.body.user.id);

    const second = await request(app).post("/api/auth/register").send({
      name: "Second",
      email,
      password: "testpass123",
    });

    expect(second.status).toBe(409);
  });

  test("POST /api/auth/register rejects a short password with 400", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Short Pass",
      email: uniqueEmail("shortpass"),
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });

  test("POST /api/auth/login succeeds with correct credentials", async () => {
    const email = uniqueEmail("login");
    const register = await request(app).post("/api/auth/register").send({
      name: "Login Test",
      email,
      password: "correctpass",
    });
    createdUserIds.push(register.body.user.id);

    const res = await request(app).post("/api/auth/login").send({
      email,
      password: "correctpass",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("POST /api/auth/login rejects a wrong password with 401", async () => {
    const email = uniqueEmail("wrongpass");
    const register = await request(app).post("/api/auth/register").send({
      name: "Wrong Pass",
      email,
      password: "correctpass",
    });
    createdUserIds.push(register.body.user.id);

    const res = await request(app).post("/api/auth/login").send({
      email,
      password: "incorrectpass",
    });

    expect(res.status).toBe(401);
  });

  test("GET /api/auth/me rejects a missing token with 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("GET /api/auth/me returns the authenticated user with a valid token", async () => {
    const email = uniqueEmail("me");
    const register = await request(app).post("/api/auth/register").send({
      name: "Me Test",
      email,
      password: "testpass123",
    });
    createdUserIds.push(register.body.user.id);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${register.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
  });
});

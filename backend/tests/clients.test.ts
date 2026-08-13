import { prisma } from "../src/lib/prisma";
import { request, app, uniqueEmail, registerUser } from "./helpers";

describe("Clients", () => {
  let adminToken: string;
  let staffAToken: string;
  let staffBToken: string;
  const userIds: string[] = [];
  const clientIds: string[] = [];

  beforeAll(async () => {
    const admin = await registerUser("ADMIN");
    const staffA = await registerUser("STAFF", "Staff A");
    const staffB = await registerUser("STAFF", "Staff B");
    adminToken = admin.token;
    staffAToken = staffA.token;
    staffBToken = staffB.token;
    userIds.push(admin.user.id, staffA.user.id, staffB.user.id);
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

  test("Staff creating a client is auto-assigned to themselves, starts at LEAD", async () => {
    const res = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ name: "Auto Assign Co", email: uniqueEmail("autoassign") });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("LEAD");
    expect(res.body.assignedTo).not.toBeNull();
    clientIds.push(res.body.id);
  });

  test("Creating a client without a required field returns 400 with details", async () => {
    const res = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ name: "Missing Email" });

    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });

  test("Creating a client with a duplicate email returns 409", async () => {
    const email = uniqueEmail("dupeclient");
    const first = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ name: "First Co", email });
    clientIds.push(first.body.id);

    const second = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ name: "Second Co", email });

    expect(second.status).toBe(409);
  });

  test("Staff only sees clients assigned to them, not another staff member's", async () => {
    const ownClient = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ name: "Staff A Client", email: uniqueEmail("staffa-scope") });
    clientIds.push(ownClient.body.id);

    const staffAList = await request(app)
      .get("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`);
    const staffBList = await request(app)
      .get("/api/clients")
      .set("Authorization", `Bearer ${staffBToken}`);

    const staffAIds = staffAList.body.map((c: { id: string }) => c.id);
    const staffBIds = staffBList.body.map((c: { id: string }) => c.id);

    expect(staffAIds).toContain(ownClient.body.id);
    expect(staffBIds).not.toContain(ownClient.body.id);
  });

  test("Admin sees clients regardless of assignment", async () => {
    const created = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffBToken}`)
      .send({ name: "Admin Visibility Co", email: uniqueEmail("adminvis") });
    clientIds.push(created.body.id);

    const adminList = await request(app)
      .get("/api/clients")
      .set("Authorization", `Bearer ${adminToken}`);

    const ids = adminList.body.map((c: { id: string }) => c.id);
    expect(ids).toContain(created.body.id);
  });

  test("Staff cannot view a client assigned to someone else (403)", async () => {
    const created = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ name: "Private To A", email: uniqueEmail("privatea") });
    clientIds.push(created.body.id);

    const res = await request(app)
      .get(`/api/clients/${created.body.id}`)
      .set("Authorization", `Bearer ${staffBToken}`);

    expect(res.status).toBe(403);
  });

  test("A valid status transition (LEAD -> ONBOARDING) succeeds and logs a note", async () => {
    const created = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ name: "Transition Co", email: uniqueEmail("transition") });
    clientIds.push(created.body.id);

    const res = await request(app)
      .patch(`/api/clients/${created.body.id}/status`)
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ status: "ONBOARDING" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ONBOARDING");

    const notes = await request(app)
      .get(`/api/clients/${created.body.id}/notes`)
      .set("Authorization", `Bearer ${staffAToken}`);

    expect(notes.body.length).toBeGreaterThan(0);
  });

  test("An illegal status transition (LEAD -> ACTIVE) is rejected with 400", async () => {
    const created = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ name: "Illegal Jump Co", email: uniqueEmail("illegaljump") });
    clientIds.push(created.body.id);

    const res = await request(app)
      .patch(`/api/clients/${created.body.id}/status`)
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ status: "ACTIVE" });

    expect(res.status).toBe(400);
  });

  test("Staff cannot reassign a client (403)", async () => {
    const created = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ name: "No Reassign Co", email: uniqueEmail("noreassign") });
    clientIds.push(created.body.id);

    const res = await request(app)
      .patch(`/api/clients/${created.body.id}`)
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ assignedToId: userIds[2] });

    expect(res.status).toBe(403);
  });

  test("Admin can reassign a client to another staff member", async () => {
    const created = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ name: "Reassign Me Co", email: uniqueEmail("reassignme") });
    clientIds.push(created.body.id);

    const res = await request(app)
      .patch(`/api/clients/${created.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ assignedToId: userIds[2] });

    expect(res.status).toBe(200);
    expect(res.body.assignedToId).toBe(userIds[2]);
  });

  test("Staff cannot delete a client (403)", async () => {
    const created = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ name: "No Delete Co", email: uniqueEmail("nodelete") });
    clientIds.push(created.body.id);

    const res = await request(app)
      .delete(`/api/clients/${created.body.id}`)
      .set("Authorization", `Bearer ${staffAToken}`);

    expect(res.status).toBe(403);
  });

  test("Admin can delete a client (204)", async () => {
    const created = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${staffAToken}`)
      .send({ name: "Delete Me Co", email: uniqueEmail("deleteme") });

    const res = await request(app)
      .delete(`/api/clients/${created.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
    // not pushed to clientIds since it's already deleted
  });
});

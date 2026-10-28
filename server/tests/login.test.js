const request = require("supertest");
const { startApp, stopApp, clearDb } = require("./helpers");
const { seedDemoUsers } = require("../utils/seedDemoUsers");
const { DEMO_USERS } = require("../utils/constants");

let app;

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);
beforeEach(async () => {
  await clearDb();
  await seedDemoUsers();
});

describe("POST /api/user/login", () => {
  it.each(Object.entries(DEMO_USERS))("logs in the %s demo account", async (role, { email, password }) => {
    const agent = request.agent(app);
    const res = await agent.post("/api/user/login").send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ email, role, status: 2, isActive: true });
    expect(res.body.data.user.password).toBeUndefined();
    const profile = await agent.get("/api/user/profile").expect(200);
    expect(profile.body.data.user.email).toBe(email);
  });

  it("rejects a wrong password", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({ email: DEMO_USERS.OWNER.email, password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("rejects an unknown email and a malformed body", async () => {
    expect((await request(app).post("/api/user/login").send({ email: "x@y.com", password: "p" })).status).toBe(401);
    expect((await request(app).post("/api/user/login").send({ email: "nope" })).status).toBe(400);
  });

  it("re-seeding keeps one user per demo email", async () => {
    await seedDemoUsers();
    const { UserModel } = require("../app/models/user");
    expect(await UserModel.countDocuments({ email: DEMO_USERS.OWNER.email })).toBe(1);
  });
});

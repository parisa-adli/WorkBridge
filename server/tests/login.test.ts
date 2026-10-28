import request from "supertest";
import type { Express } from "express";
import { startApp, stopApp, clearDb } from "./helpers";
import { seedDemoUsers } from "../utils/seedDemoUsers";
import { DEMO_USERS } from "../utils/constants";
import { ERROR_CODES, SUCCESS_CODES } from "../utils/errorCodes";
import { UserModel } from "../app/models/user";

let app: Express;

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
    expect(res.body.data.code).toBe(SUCCESS_CODES.LOGGED_IN);
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
    expect(res.body.code).toBe(ERROR_CODES.INVALID_CREDENTIALS);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("rejects an unknown email and a malformed body", async () => {
    const unknown = await request(app).post("/api/user/login").send({ email: "x@y.com", password: "p" });
    expect(unknown.status).toBe(401);
    const malformed = await request(app).post("/api/user/login").send({ email: "nope" });
    expect(malformed.status).toBe(400);
    expect(malformed.body).toMatchObject({ code: ERROR_CODES.INVALID_EMAIL, field: "email" });
    const noPassword = await request(app).post("/api/user/login").send({ email: DEMO_USERS.OWNER.email });
    expect(noPassword.body).toMatchObject({ code: ERROR_CODES.PASSWORD_REQUIRED, field: "password" });
  });

  it("re-seeding keeps one user per demo email", async () => {
    await seedDemoUsers();
    expect(await UserModel.countDocuments({ email: DEMO_USERS.OWNER.email })).toBe(1);
  });
});

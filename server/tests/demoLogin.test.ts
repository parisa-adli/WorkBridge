import request from "supertest";
import type { Express } from "express";
import { startApp, stopApp, clearDb, createUser } from "./helpers";
import { seedDemoUsers } from "../utils/seedDemoUsers";
import { DEMO_USERS, ROLES, STATUS } from "../utils/constants";
import { hashPassword } from "../utils/functions";
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

async function demoLogin(role: keyof typeof DEMO_USERS) {
  const agent = request.agent(app);
  const { username, password } = DEMO_USERS[role];
  await agent.post("/api/user/demo-login").send({ username, password }).expect(200);
  return agent;
}

// cookie name and flags, without the token value and expiry
const cookieShape = (res: request.Response) =>
  res.get("Set-Cookie")!.map((c) =>
    c
      .split("; ")
      .filter((part) => !/^(Expires|Max-Age)=/i.test(part))
      .map((part, i) => (i === 0 ? part.split("=")[0] : part))
      .join("; ")
  );

describe("POST /api/user/demo-login", () => {
  it.each(Object.entries(DEMO_USERS))("logs in the %s demo account", async (role, { username, password }) => {
    const agent = request.agent(app);
    const res = await agent.post("/api/user/demo-login").send({ username, password });

    expect(res.status).toBe(200);
    expect(res.body.data.code).toBe(SUCCESS_CODES.LOGGED_IN);
    expect(res.body.data.user).toMatchObject({ username, role, status: STATUS.ACCEPTED, isActive: true });
    expect(res.body.data.user.password).toBeUndefined();
    expect((await agent.get("/api/user/profile").expect(200)).body.data.user.username).toBe(username);
    // the same refresh flow as an OTP session
    await agent.get("/api/user/refresh-token").expect(200);
  });

  it("sets the same cookies as OTP login", async () => {
    const { username, password } = DEMO_USERS.OWNER;
    const demo = await request(app).post("/api/user/demo-login").send({ username, password });
    await request(app).post("/api/user/get-otp").send({ phoneNumber: "09120000001" });
    const { otp } = (await UserModel.findOne({ phoneNumber: "09120000001" }))!;
    const viaOtp = await request(app)
      .post("/api/user/check-otp")
      .send({ phoneNumber: "09120000001", otp: String(otp!.code) });

    expect(cookieShape(demo)).toEqual(cookieShape(viaOtp));
    expect(cookieShape(demo).map((c) => c.split("; ")[0])).toEqual(["accessToken", "refreshToken"]);
  });

  it("rejects a wrong password without setting cookies", async () => {
    const res = await request(app)
      .post("/api/user/demo-login")
      .send({ username: DEMO_USERS.OWNER.username, password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(ERROR_CODES.INVALID_CREDENTIALS);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("accepts only the seeded demo usernames", async () => {
    // even a real user with a username and a password hash is refused
    await UserModel.create({ username: "someone", password: await hashPassword("Pass@1234"), status: STATUS.ACCEPTED });
    const other = await request(app).post("/api/user/demo-login").send({ username: "someone", password: "Pass@1234" });
    expect(other.status).toBe(400);
    expect(other.body).toMatchObject({ code: ERROR_CODES.INVALID_USERNAME, field: "username" });
    expect(other.headers["set-cookie"]).toBeUndefined();

    const noPassword = await request(app).post("/api/user/demo-login").send({ username: DEMO_USERS.OWNER.username });
    expect(noPassword.body).toMatchObject({ code: ERROR_CODES.PASSWORD_REQUIRED, field: "password" });
  });

  it("rejects a demo username that was never seeded", async () => {
    await UserModel.deleteMany({});
    const { username, password } = DEMO_USERS.OWNER;
    const res = await request(app).post("/api/user/demo-login").send({ username, password });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(ERROR_CODES.INVALID_CREDENTIALS);
  });

  it("is a 404 when DEMO_LOGIN_ENABLED is false", async () => {
    process.env.DEMO_LOGIN_ENABLED = "false";
    try {
      const { username, password } = DEMO_USERS.OWNER;
      const res = await request(app).post("/api/user/demo-login").send({ username, password });
      expect(res.status).toBe(404);
      expect(res.body.code).toBe(ERROR_CODES.ROUTE_NOT_FOUND);
      expect(res.headers["set-cookie"]).toBeUndefined();
    } finally {
      process.env.DEMO_LOGIN_ENABLED = "true";
    }
  });

  it("the old email login route is gone", async () => {
    const { email, password } = DEMO_USERS.OWNER;
    const res = await request(app).post("/api/user/login").send({ email, password });
    expect(res.status).toBe(404);
  });
});

describe("demo account lock", () => {
  const demoId = async (role: keyof typeof DEMO_USERS) =>
    (await UserModel.findOne({ username: DEMO_USERS[role].username }))!._id;
  const setStatus = (agent: request.Agent, userId: unknown, status: number) =>
    agent.patch(`/api/admin/user/verify/${userId}`).send({ status });

  it("the demo admin can't change its own status", async () => {
    const admin = await demoLogin("ADMIN");
    const res = await setStatus(admin, await demoId("ADMIN"), STATUS.REJECTED);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe(ERROR_CODES.DEMO_ACCOUNT_LOCKED);
    expect((await UserModel.findById(await demoId("ADMIN")))!.status).toBe(STATUS.ACCEPTED);
  });

  it.each(["OWNER", "FREELANCER"] as const)("no admin can demote the %s demo account", async (role) => {
    const demoAdmin = await demoLogin("ADMIN");
    const { agent: realAdmin } = await createUser(app, { phoneNumber: "09120000009", role: ROLES.ADMIN });
    for (const agent of [demoAdmin, realAdmin]) {
      const res = await setStatus(agent, await demoId(role), STATUS.PENDING);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe(ERROR_CODES.DEMO_ACCOUNT_LOCKED);
    }
    expect((await UserModel.findById(await demoId(role)))!.status).toBe(STATUS.ACCEPTED);
  });

  it("the demo admin can still review real users", async () => {
    const admin = await demoLogin("ADMIN");
    const { user } = await createUser(app, { phoneNumber: "09120000008", role: ROLES.OWNER, status: STATUS.PENDING });
    await setStatus(admin, user._id, STATUS.ACCEPTED).expect(200);
  });

  it("a demo account can't change its own role", async () => {
    const owner = await demoLogin("OWNER");
    const res = await owner
      .post("/api/user/complete-profile")
      .send({ name: "demo owner", email: "x@test.com", role: ROLES.FREELANCER });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe(ERROR_CODES.DEMO_ACCOUNT_LOCKED);
    expect((await UserModel.findById(await demoId("OWNER")))!.role).toBe(ROLES.OWNER);
  });
});

describe("seedDemoUsers", () => {
  it("re-seeding keeps one user per demo username", async () => {
    await seedDemoUsers();
    expect(await UserModel.countDocuments({ username: DEMO_USERS.OWNER.username })).toBe(1);
  });

  it("never takes over a real user who has a demo email", async () => {
    await UserModel.deleteMany({});
    const real = await UserModel.create({ phoneNumber: "09120000007", email: DEMO_USERS.OWNER.email });
    await seedDemoUsers();
    const after = (await UserModel.findById(real._id))!;
    expect(after.username).toBeUndefined();
    expect(after.password).toBeUndefined();
  });
});

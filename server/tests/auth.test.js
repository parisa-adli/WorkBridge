const request = require("supertest");
const { startApp, stopApp, clearDb, login } = require("./helpers");
const { UserModel } = require("../app/models/user");

const PHONE = "09120000001";
let app;

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);
beforeEach(clearDb);

describe("POST /api/user/get-otp", () => {
  it("rejects a missing phone number", async () => {
    const res = await request(app).post("/api/user/get-otp").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("شماره موبایل معتبر را وارد کنید");
  });

  it("creates a pending OWNER user with a 6-digit OTP", async () => {
    const res = await request(app).post("/api/user/get-otp").send({ phoneNumber: ` ${PHONE} ` });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ expiresIn: 90000, phoneNumber: PHONE });
    const user = await UserModel.findOne({ phoneNumber: PHONE });
    expect(user).toMatchObject({ status: 1, role: "OWNER", isActive: false, isVerifiedPhoneNumber: false });
    expect(String(user.otp.code)).toMatch(/^\d{6}$/);
    expect(user.otp.expiresIn.getTime()).toBeGreaterThan(Date.now());
  });

  it("issues a new code to an existing user", async () => {
    await request(app).post("/api/user/get-otp").send({ phoneNumber: PHONE });
    const before = (await UserModel.findOne({ phoneNumber: PHONE })).otp.expiresIn;

    const res = await request(app).post("/api/user/get-otp").send({ phoneNumber: PHONE });

    expect(res.status).toBe(200);
    expect(await UserModel.countDocuments({ phoneNumber: PHONE })).toBe(1);
    expect((await UserModel.findOne({ phoneNumber: PHONE })).otp.expiresIn.getTime()).toBeGreaterThan(before.getTime());
  });

  it("accepts a malformed phone number (getOtpSchema is not used)", async () => {
    const res = await request(app).post("/api/user/get-otp").send({ phoneNumber: "abc" });
    expect(res.status).toBe(200);
    expect(await UserModel.countDocuments({ phoneNumber: "abc" })).toBe(1);
  });
});

describe("POST /api/user/check-otp", () => {
  const getCode = async () => String((await UserModel.findOne({ phoneNumber: PHONE })).otp.code);

  beforeEach(async () => {
    await request(app).post("/api/user/get-otp").send({ phoneNumber: PHONE });
  });

  it("rejects a wrong code", async () => {
    const code = await getCode();
    const wrong = code === "111111" ? "222222" : "111111";
    const res = await request(app).post("/api/user/check-otp").send({ phoneNumber: PHONE, otp: wrong });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("کد ارسال شده صحیح نمیباشد");
  });

  it("returns 404 for an unknown phone number", async () => {
    const res = await request(app).post("/api/user/check-otp").send({ phoneNumber: "09129999999", otp: "123456" });
    expect(res.status).toBe(404);
  });

  it("rejects an expired code", async () => {
    await UserModel.updateOne({ phoneNumber: PHONE }, { "otp.expiresIn": Date.now() - 1000 });
    const res = await request(app).post("/api/user/check-otp").send({ phoneNumber: PHONE, otp: await getCode() });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("کد اعتبار سنجی منقضی شده است");
  });

  it("logs in with the right code, sets both cookies and returns the user (otp included)", async () => {
    const code = await getCode();
    const res = await request(app).post("/api/user/check-otp").send({ phoneNumber: PHONE, otp: code });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("کد تایید شد، لطفا اطلاعات خود را تکمیل کنید");
    expect(res.body.data.user.otp.code).toBe(Number(code)); // known bug: OTP leaks in the response
    const cookies = res.headers["set-cookie"].join(";");
    expect(cookies).toMatch(/accessToken=s%3A/);
    expect(cookies).toMatch(/refreshToken=s%3A/);
    expect((await UserModel.findOne({ phoneNumber: PHONE })).isVerifiedPhoneNumber).toBe(true);
  });

  it("accepts the same code twice (OTP is not cleared after use)", async () => {
    const code = await getCode();
    await request(app).post("/api/user/check-otp").send({ phoneNumber: PHONE, otp: code }).expect(200);
    const res = await request(app).post("/api/user/check-otp").send({ phoneNumber: PHONE, otp: code });
    expect(res.status).toBe(200);
  });
});

describe("session", () => {
  it("GET /profile needs the access cookie", async () => {
    const res = await request(app).get("/api/user/profile");
    expect(res.status).toBe(401);
  });

  it("GET /profile returns the user without otp", async () => {
    const agent = await login(app, PHONE);
    const res = await agent.get("/api/user/profile");
    expect(res.status).toBe(200);
    expect(res.body.data.user.phoneNumber).toBe(PHONE);
    expect(res.body.data.user.otp).toBeUndefined();
  });

  it("GET /refresh-token returns the user under a capitalized StatusCode key", async () => {
    const agent = await login(app, PHONE);
    const res = await agent.get("/api/user/refresh-token");
    expect(res.status).toBe(200);
    expect(res.body.StatusCode).toBe(200);
    expect(res.body.data.user.phoneNumber).toBe(PHONE);
  });

  it("POST /logout returns a body without the data envelope", async () => {
    const res = await request(app).post("/api/user/logout");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ StatusCode: 200, roles: null, auth: false });
  });
});

describe("POST /api/user/complete-profile", () => {
  const profile = { name: "Test User", email: "Test@Example.com", role: "FREELANCER" };

  it("needs to be logged in", async () => {
    const res = await request(app).post("/api/user/complete-profile").send(profile);
    expect(res.status).toBe(401);
  });

  it("saves name, email and role, activates the user but leaves status pending", async () => {
    const agent = await login(app, PHONE);
    const res = await agent.post("/api/user/complete-profile").send(profile);

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("اطلاعات شما با موفقیت تکمیل شد");
    expect(res.body.data.user).toMatchObject({
      name: "Test User",
      email: "test@example.com",
      role: "FREELANCER",
      isActive: true,
      status: 1,
    });
  });

  it("pending users are blocked from verified-only routes", async () => {
    const agent = await login(app, PHONE);
    await agent.post("/api/user/complete-profile").send(profile).expect(200);
    const res = await agent.get("/api/project/list");
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("پروفایل شما در انتظار بررسی است.");
  });

  it("rejects the ADMIN role", async () => {
    const agent = await login(app, PHONE);
    const res = await agent.post("/api/user/complete-profile").send({ ...profile, role: "ADMIN" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("نقش وارد شده صحیح نمی باشد");
  });

  it("rejects an email another user already has", async () => {
    const other = await login(app, "09120000002");
    await other.post("/api/user/complete-profile").send(profile).expect(200);

    const agent = await login(app, PHONE);
    const res = await agent.post("/api/user/complete-profile").send({ ...profile, email: "test@example.com" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("کاربری با این ایمیل قبلا ثبت نام کرده است.");
  });

  it("rejects a profile without email as a duplicate (known bug)", async () => {
    const agent = await login(app, PHONE);
    const res = await agent.post("/api/user/complete-profile").send({ name: "Test User", role: "OWNER" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("کاربری با این ایمیل قبلا ثبت نام کرده است.");
  });
});

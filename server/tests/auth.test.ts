import type { Express } from "express";
import request from "supertest";
import { startApp, stopApp, clearDb, login } from "./helpers";
import { UserModel } from "../app/models/user";
import { cookieOptions } from "../utils/functions";
import { ERROR_CODES, SUCCESS_CODES } from "../utils/errorCodes";

const PHONE = "09120000001";
let app: Express;

// get-otp has created the user before these lookups
const findUser = async (phoneNumber = PHONE) => (await UserModel.findOne({ phoneNumber }))!;

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

  it("rejects a request with no body the same way", async () => {
    const res = await request(app).post("/api/user/get-otp");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("شماره موبایل معتبر را وارد کنید");
  });

  it("creates a pending OWNER user with a 6-digit OTP", async () => {
    const res = await request(app).post("/api/user/get-otp").send({ phoneNumber: ` ${PHONE} ` });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ expiresIn: 90000, phoneNumber: PHONE });
    const user = await findUser();
    expect(user).toMatchObject({ status: 1, role: "OWNER", isActive: false, isVerifiedPhoneNumber: false });
    expect(String(user.otp!.code)).toMatch(/^\d{6}$/);
    expect(user.otp!.expiresIn.getTime()).toBeGreaterThan(Date.now());
  });

  it("issues a new code to an existing user", async () => {
    await request(app).post("/api/user/get-otp").send({ phoneNumber: PHONE });
    const before = (await findUser()).otp!.expiresIn;

    const res = await request(app).post("/api/user/get-otp").send({ phoneNumber: PHONE });

    expect(res.status).toBe(200);
    expect(await UserModel.countDocuments({ phoneNumber: PHONE })).toBe(1);
    expect((await findUser()).otp!.expiresIn.getTime()).toBeGreaterThan(before.getTime());
  });

  it("rejects a malformed phone number", async () => {
    const res = await request(app).post("/api/user/get-otp").send({ phoneNumber: "abc" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("شماره موبایل وارد شده صحیح نمیباشد");
    expect(await UserModel.countDocuments({ phoneNumber: "abc" })).toBe(0);
  });

  it("returns the OTP as `otp` outside production, next to the message code", async () => {
    const res = await request(app).post("/api/user/get-otp").send({ phoneNumber: PHONE });
    const user = await findUser();
    expect(res.body.data.otp).toBe(user.otp!.code);
    expect(res.body.data.code).toBe(SUCCESS_CODES.OTP_SENT);
  });

  it("logs the phone number and code to the console outside production", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const res = await request(app).post("/api/user/get-otp").send({ phoneNumber: PHONE });
      expect(res.status).toBe(200);
      expect(log).toHaveBeenCalledWith(`[dev OTP] ${PHONE}: ${res.body.data.otp}`);
    } finally {
      log.mockRestore();
    }
  });

  it("does not return the code in production", async () => {
    process.env.NODE_ENV = "production";
    try {
      const res = await request(app).post("/api/user/get-otp").send({ phoneNumber: PHONE });
      expect(res.status).toBe(200);
      expect(res.body.data.otp).toBeUndefined();
    } finally {
      process.env.NODE_ENV = "development";
    }
  });

  it("gives two concurrent requests their own codes", async () => {
    const phones = ["09120000011", "09120000012"];
    const responses = await Promise.all(
      phones.map((phoneNumber) => request(app).post("/api/user/get-otp").send({ phoneNumber }))
    );
    for (const [i, phoneNumber] of phones.entries()) {
      const user = await findUser(phoneNumber);
      expect(responses[i].body.data.otp).toBe(user.otp!.code);
    }
  });
});

describe("POST /api/user/check-otp", () => {
  const getCode = async () => String((await findUser()).otp!.code);

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

  it("logs in with the right code, sets both cookies and returns the user without otp", async () => {
    const code = await getCode();
    const res = await request(app).post("/api/user/check-otp").send({ phoneNumber: PHONE, otp: code });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("کد تایید شد، لطفا اطلاعات خود را تکمیل کنید");
    expect(res.body.data.user.phoneNumber).toBe(PHONE);
    expect(res.body.data.user.otp).toBeUndefined();
    const cookies = res.get("Set-Cookie")!.join(";");
    expect(cookies).toMatch(/accessToken=s%3A/);
    expect(cookies).toMatch(/refreshToken=s%3A/);
    expect((await findUser()).isVerifiedPhoneNumber).toBe(true);
  });

  it("rejects the same code a second time", async () => {
    const code = await getCode();
    await request(app).post("/api/user/check-otp").send({ phoneNumber: PHONE, otp: code }).expect(200);
    const res = await request(app).post("/api/user/check-otp").send({ phoneNumber: PHONE, otp: code });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("کد ارسال شده صحیح نمیباشد");
  });

  it("rejects a request without a code", async () => {
    const res = await request(app).post("/api/user/check-otp").send({ phoneNumber: PHONE });
    expect(res.status).toBe(400);
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

  it("GET /refresh-token returns the user in the standard envelope", async () => {
    const agent = await login(app, PHONE);
    const res = await agent.get("/api/user/refresh-token");
    expect(res.status).toBe(200);
    expect(res.body.statusCode).toBe(200);
    expect(res.body.StatusCode).toBeUndefined();
    expect(res.body.data.user.phoneNumber).toBe(PHONE);
    expect(res.body.data.user.otp).toBeUndefined();
  });

  it("GET /refresh-token without the cookie is a 401 with a code", async () => {
    const res = await request(app).get("/api/user/refresh-token");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(ERROR_CODES.LOGIN_REQUIRED);
  });

  it("POST /logout returns the standard envelope", async () => {
    const res = await request(app).post("/api/user/logout");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      statusCode: 200,
      data: { message: "از حساب کاربری خود خارج شدید", code: SUCCESS_CODES.LOGGED_OUT },
    });
  });

  it("POST /logout cookies are not secure in development, like the login cookies", async () => {
    const res = await request(app).post("/api/user/logout");
    expect(res.headers["set-cookie"]).toHaveLength(2);
    expect(res.get("Set-Cookie")!.join(";")).not.toMatch(/Secure/);
  });

  it("cookieOptions is secure everywhere but development", () => {
    expect(cookieOptions({ NODE_ENV: "development", DOMAIN: "x.ir" })).toEqual({
      httpOnly: true,
      signed: true,
      sameSite: "Lax",
      secure: false,
      domain: "x.ir",
    });
    expect(cookieOptions({ NODE_ENV: "production" }).secure).toBe(true);
    expect(cookieOptions({ NODE_ENV: "test" }).secure).toBe(true);
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

  it("completes a profile without email", async () => {
    const other = await login(app, "09120000002");
    await other.post("/api/user/complete-profile").send(profile).expect(200);

    const agent = await login(app, PHONE);
    const res = await agent.post("/api/user/complete-profile").send({ name: "Test User", role: "OWNER" });
    expect(res.status).toBe(200);
    const user = await findUser();
    expect(user).toMatchObject({ name: "Test User", role: "OWNER", isActive: true });
    expect(user.email).toBeUndefined();
  });

  it("lets a user complete the profile again with their own email", async () => {
    const agent = await login(app, PHONE);
    await agent.post("/api/user/complete-profile").send(profile).expect(200);
    const res = await agent.post("/api/user/complete-profile").send(profile);
    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/user/update", () => {
  const update = { name: "Updated Name", email: "new@example.com", biography: "React" };

  it("updates the profile", async () => {
    const agent = await login(app, PHONE);
    const res = await agent.patch("/api/user/update").send(update);
    expect(res.status).toBe(200);
    expect(res.body.data.code).toBe(SUCCESS_CODES.PROFILE_UPDATED);
    expect(await findUser()).toMatchObject(update);
  });

  it("accepts an empty biography", async () => {
    const agent = await login(app, PHONE);
    const res = await agent.patch("/api/user/update").send({ ...update, biography: "" });
    expect(res.status).toBe(200);
  });
});

// Every auth route validates its body with Zod: 400, the first failing field, its code and the Persian message.
describe("validation errors", () => {
  const cases: [string, string, Record<string, unknown>, string, string, string][] = [
    ["get-otp", "post", {}, "phoneNumber", ERROR_CODES.PHONE_REQUIRED, "شماره موبایل معتبر را وارد کنید"],
    ["get-otp", "post", { phoneNumber: "   " }, "phoneNumber", ERROR_CODES.INVALID_PHONE, "شماره موبایل وارد شده صحیح نمیباشد"],
    ["get-otp", "post", { phoneNumber: "0912000000" }, "phoneNumber", ERROR_CODES.INVALID_PHONE, "شماره موبایل وارد شده صحیح نمیباشد"],
    ["check-otp", "post", { phoneNumber: PHONE }, "otp", ERROR_CODES.INVALID_OTP, "کد ارسال شده صحیح نمیباشد"],
    ["check-otp", "post", { phoneNumber: PHONE, otp: "1234" }, "otp", ERROR_CODES.INVALID_OTP, "کد ارسال شده صحیح نمیباشد"],
    ["check-otp", "post", { phoneNumber: PHONE, otp: "1234567" }, "otp", ERROR_CODES.INVALID_OTP, "کد ارسال شده صحیح نمیباشد"],
    ["check-otp", "post", { phoneNumber: PHONE, otp: 123456 }, "otp", ERROR_CODES.INVALID_OTP, "کد ارسال شده صحیح نمیباشد"],
    ["check-otp", "post", { phoneNumber: "123", otp: "123456" }, "phoneNumber", ERROR_CODES.INVALID_PHONE, "شماره موبایل وارد شده صحیح نمیباشد"],
    ["complete-profile", "post", { role: "OWNER", name: "abcd" }, "name", ERROR_CODES.INVALID_NAME, "نام کاربری وارد شده صحیح نمی باشد"],
    ["complete-profile", "post", { role: "OWNER", name: "a".repeat(101) }, "name", ERROR_CODES.INVALID_NAME, "نام کاربری وارد شده صحیح نمی باشد"],
    ["complete-profile", "post", { role: "OWNER", email: "not-an-email" }, "email", ERROR_CODES.INVALID_EMAIL, "ایمیل وارد شده صحیح نمی باشد"],
    ["complete-profile", "post", { name: "Test User" }, "role", ERROR_CODES.INVALID_ROLE, "نقش وارد شده صحیح نمی باشد"],
    ["update", "patch", { email: "a@b.com" }, "name", ERROR_CODES.INVALID_NAME, "نام کاربری وارد شده صحیح نمی باشد"],
    ["update", "patch", { name: "a".repeat(51), email: "a@b.com" }, "name", ERROR_CODES.INVALID_NAME, "نام کاربری وارد شده صحیح نمی باشد"],
    ["update", "patch", { name: "Test User" }, "email", ERROR_CODES.INVALID_EMAIL, "ایمیل وارد شده صحیح نمی باشد"],
    ["update", "patch", { name: "Test User", email: "a@b.com", phoneNumber: "0912" }, "phoneNumber", ERROR_CODES.INVALID_PHONE, "شماره موبایل وارد شده صحیح نمیباشد"],
    ["update", "patch", { name: "Test User", email: "a@b.com", biography: "a".repeat(31) }, "biography", ERROR_CODES.INVALID_BIOGRAPHY, "حوزه تخصصی صحیح نمی باشد."],
  ];

  it.each(cases)("%s %s %j fails on %s", async (route, method, body, field, code, message) => {
    const agent = route === "get-otp" || route === "check-otp" ? request.agent(app) : await login(app, PHONE);
    const res = await (method === "patch" ? agent.patch(`/api/user/${route}`) : agent.post(`/api/user/${route}`)).send(body);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, code, message, field });
  });
});

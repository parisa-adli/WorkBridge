import type { Express } from "express";
import request from "supertest";
import { startApp, stopApp } from "./helpers";

// Hoisted above the imports: runs after setup.ts and before the app (and its limiters) load.
vi.hoisted(() => {
  process.env.OTP_RATE_LIMIT = "2";
});

let app: Express;

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);

describe.each(["get-otp", "check-otp"])("POST /api/user/%s rate limit", (route) => {
  it("returns 429 with a message after the limit", async () => {
    const send = () => request(app).post(`/api/user/${route}`).send({ phoneNumber: "09120000001", otp: "123456" });
    await send();
    await send();

    const res = await send();
    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      statusCode: 429,
      message: "تعداد درخواست‌ها زیاد است، لطفا چند دقیقه دیگر دوباره تلاش کنید",
    });
  });
});

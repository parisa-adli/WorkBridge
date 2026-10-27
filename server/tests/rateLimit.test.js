const request = require("supertest");
const { startApp, stopApp } = require("./helpers");

// Runs after setup.js and before the app (and its limiters) load.
process.env.OTP_RATE_LIMIT = "2";

let app;

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

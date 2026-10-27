import type { Express } from "express";
import request from "supertest";
import { startApp, stopApp } from "./helpers";

let app: Express;

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);

describe("static files", () => {
  it.each(["/app/server.js", "/app/server.ts", "/package.json"])("does not serve server source %s", async (path) => {
    const res = await request(app).get(path);
    expect(res.status).toBe(404);
  });
});

describe("security middleware", () => {
  it("sends helmet headers", async () => {
    const res = await request(app).get("/api/category/list");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("rejects an oversized JSON body with 413", async () => {
    const res = await request(app)
      .post("/api/user/get-otp")
      .send({ phoneNumber: "0".repeat(200 * 1024) });
    expect(res.status).toBe(413);
  });
});

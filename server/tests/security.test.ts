import type { Express } from "express";
import request from "supertest";
import { startApp, stopApp } from "./helpers";
import { allowFallbackCode } from "./setup";
import { ERROR_CODES } from "../utils/errorCodes";
import { CategoryModel } from "../app/models/category";

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
    allowFallbackCode(); // thrown by the body parser, so the handler gives it the generic code
    const res = await request(app)
      .post("/api/user/get-otp")
      .send({ phoneNumber: "0".repeat(200 * 1024) });
    expect(res.status).toBe(413);
    expect(res.body.code).toBe(ERROR_CODES.BAD_REQUEST);
  });
});

describe("error envelope", () => {
  it("an unknown API route is a 404 with its own code", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      statusCode: 404,
      code: ERROR_CODES.ROUTE_NOT_FOUND,
      message: "آدرس مورد نظر یافت نشد",
    });
  });

  it("an error with no code of ours gets the generic 500 code", async () => {
    allowFallbackCode();
    // A Mongoose failure is the real case: no status, no code of ours.
    const spy = vi.spyOn(CategoryModel, "find").mockRejectedValueOnce(new Error("db down"));
    const res = await request(app).get("/api/category/list");
    spy.mockRestore();
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ statusCode: 500, code: ERROR_CODES.INTERNAL_ERROR, message: "db down" });
  });
});

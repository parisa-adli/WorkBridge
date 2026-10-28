import fs from "fs";
import path from "path";
import type { Express } from "express";
import request from "supertest";
import { startApp, stopApp, clearDb, login } from "./helpers";
import { ERROR_CODES, SUCCESS_CODES } from "../utils/errorCodes";

const PHONE = "09120000001";
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)]);
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64)]);
const WEBP = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.alloc(64)]);
const UPLOADS = path.join(__dirname, "..", "uploads");
let app: Express;

// avatarUrl is SERVER_URL + "/uploads/<file>"
const fileOf = (avatarUrl: string) => path.join(UPLOADS, path.basename(avatarUrl));
const saved: string[] = [];

beforeAll(async () => {
  app = await startApp();
});
afterAll(async () => {
  saved.forEach((file) => fs.rmSync(file, { force: true }));
  await stopApp();
});
beforeEach(clearDb);

describe("PATCH /api/user/avatar", () => {
  it.each([
    ["png", "image/png", PNG],
    ["jpg", "image/jpeg", JPG],
    ["webp", "image/webp", WEBP],
  ])("saves a %s and returns it as avatarUrl", async (extension, type, image) => {
    const agent = await login(app, PHONE);
    const res = await agent.patch("/api/user/avatar").set("Content-Type", type).send(image);

    expect(res.status).toBe(200);
    expect(res.body.data.code).toBe(SUCCESS_CODES.AVATAR_UPDATED);
    const { avatarUrl } = res.body.data;
    saved.push(fileOf(avatarUrl));
    expect(avatarUrl).toMatch(new RegExp(`^http://localhost:5000/uploads/[a-f0-9]{24}-\\d+\\.${extension}$`));
    expect(fs.readFileSync(fileOf(avatarUrl))).toEqual(image);
    expect((await agent.get("/api/user/profile")).body.data.user.avatarUrl).toBe(avatarUrl);
  });

  it("serves the saved file and deletes the old one on replace", async () => {
    const agent = await login(app, PHONE);
    const first = (await agent.patch("/api/user/avatar").set("Content-Type", "image/png").send(PNG)).body.data;
    const second = (await agent.patch("/api/user/avatar").set("Content-Type", "image/jpeg").send(JPG)).body.data;
    saved.push(fileOf(first.avatarUrl), fileOf(second.avatarUrl));

    expect(fs.existsSync(fileOf(first.avatarUrl))).toBe(false);
    const served = await request(app).get(new URL(second.avatarUrl).pathname).buffer(true);
    expect(served.status).toBe(200);
    expect(served.body).toEqual(JPG);
  });

  it("rejects an image over 2 MB", async () => {
    const agent = await login(app, PHONE);
    const big = Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)]);
    const res = await agent.patch("/api/user/avatar").set("Content-Type", "image/png").send(big);

    expect(res.status).toBe(413);
    expect(res.body.code).toBe(ERROR_CODES.AVATAR_TOO_LARGE);
    expect((await agent.get("/api/user/profile")).body.data.user.avatarUrl).toBeNull();
  });

  it.each([
    ["a disallowed Content-Type", "image/gif", Buffer.from("GIF89a")],
    ["a non-image Content-Type", "application/pdf", PNG],
    ["bytes that aren't the claimed image", "image/png", Buffer.from("<svg></svg>")],
  ])("rejects %s", async (_, type, body) => {
    const agent = await login(app, PHONE);
    const res = await agent.patch("/api/user/avatar").set("Content-Type", type).send(body);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(ERROR_CODES.INVALID_AVATAR_TYPE);
    expect((await agent.get("/api/user/profile")).body.data.user.avatarUrl).toBeNull();
  });

  it("rejects a request without a body", async () => {
    const agent = await login(app, PHONE);
    const res = await agent.patch("/api/user/avatar");
    expect(res.body.code).toBe(ERROR_CODES.INVALID_AVATAR_TYPE);
  });

  it("requires login", async () => {
    const res = await request(app).patch("/api/user/avatar").set("Content-Type", "image/png").send(PNG);
    expect(res.status).toBe(401);
  });
});

import type { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import { startApp, stopApp, clearDb, createUser, createCategory, type TestUser } from "./helpers";
import { CategoryModel } from "../app/models/category";
import { ProjectModel } from "../app/models/project";
import { ERROR_CODES } from "../utils/errorCodes";
import { escapeRegex } from "../utils/functions";

let app: Express;

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);
beforeEach(async () => {
  await clearDb();
  await createCategory("web");
  await createCategory("mobile");
});

const list = (query: string) => request(app).get(`/api/category/list${query}`);
const titles = (res: request.Response) =>
  res.body.data.categories.map((c: { englishTitle: string }) => c.englishTitle).sort();

describe("GET /api/category/list", () => {
  it("filters by a whitelisted field", async () => {
    const res = await list("?englishTitle=web");
    expect(res.status).toBe(200);
    expect(titles(res)).toEqual(["web"]);
  });

  it("ignores query operators instead of passing them to Mongo", async () => {
    const res = await list("?englishTitle[$ne]=web");
    expect(res.status).toBe(200);
    expect(titles(res)).toEqual(["mobile", "web"]);
  });

  it("ignores fields outside the whitelist", async () => {
    const res = await list("?description=nope&_id[$exists]=false");
    expect(res.status).toBe(200);
    expect(titles(res)).toEqual(["mobile", "web"]);
  });
});

describe("admin category writes that change nothing", () => {
  let admin: TestUser["agent"], web: { _id: unknown };
  beforeEach(async () => {
    ({ agent: admin } = await createUser(app, { phoneNumber: "09120000031", role: "ADMIN" }));
    web = (await CategoryModel.findOne({ englishTitle: "web" }))!;
  });

  it("update returns its own 500 message (was a ReferenceError)", async () => {
    vi.spyOn(CategoryModel, "updateOne").mockResolvedValueOnce({ modifiedCount: 0 } as mongoose.UpdateWriteOpResult);
    const res = await admin
      .patch(`/api/admin/category/update/${web._id}`)
      .send({ title: "دسته وب", englishTitle: "web", description: "category", type: "post" });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("به روزرسانی انجام نشد");
  });

  it("remove returns its own 500 message (was a ReferenceError)", async () => {
    vi.spyOn(CategoryModel, "deleteMany").mockResolvedValueOnce({ deletedCount: 0 } as mongoose.mongo.DeleteResult);
    const res = await admin.delete(`/api/admin/category/remove/${web._id}`);
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("حدف دسته بندی انجام نشد");
  });
});

describe("admin category management", () => {
  let admin: TestUser["agent"], web: { _id: mongoose.Types.ObjectId };
  beforeEach(async () => {
    ({ agent: admin } = await createUser(app, { phoneNumber: "09120000032", role: "ADMIN" }));
    web = (await CategoryModel.findOne({ englishTitle: "web" }))!;
  });
  const fields = { title: "دسته فرانت", englishTitle: "frontend", description: "category" };

  it("update accepts type project", async () => {
    await CategoryModel.updateOne({ _id: web._id }, { type: "post" });
    const res = await admin.patch(`/api/admin/category/update/${web._id}`).send({ ...fields, type: "project" });
    expect(res.status).toBe(200);
    expect((await CategoryModel.findById(web._id))!.type).toBe("project");
  });

  it("create saves parentId", async () => {
    const res = await admin.post("/api/admin/category/add").send({ ...fields, type: "project", parentId: String(web._id) });
    expect(res.status).toBe(201);
    const child = (await CategoryModel.findOne({ englishTitle: "frontend" }))!;
    expect(String(child.parentId)).toBe(String(web._id));
  });

  it("create without a parent saves null", async () => {
    await admin.post("/api/admin/category/add").send({ ...fields, type: "project", parentId: "" }).expect(201);
    expect((await CategoryModel.findOne({ englishTitle: "frontend" }))!.parentId).toBeNull();
  });

  it("create rejects an unknown parent with 404", async () => {
    const res = await admin
      .post("/api/admin/category/add")
      .send({ ...fields, type: "project", parentId: "0123456789abcdef01234567" });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
  });

  it("delete removes the category and its children", async () => {
    await CategoryModel.create({ ...fields, parentId: web._id });
    await admin.delete(`/api/admin/category/remove/${web._id}`).expect(200);
    expect(await CategoryModel.countDocuments({ englishTitle: { $in: ["web", "frontend"] } })).toBe(0);
  });

  const createProjectIn = (category: mongoose.Types.ObjectId) =>
    ProjectModel.create({
      title: "project",
      description: "description",
      category,
      budget: 1000,
      deadline: new Date(),
      owner: new mongoose.Types.ObjectId(),
    });

  it("delete is blocked with 409 when a project uses the category", async () => {
    await createProjectIn(web._id);
    const res = await admin.delete(`/api/admin/category/remove/${web._id}`);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe(ERROR_CODES.CATEGORY_IN_USE);
    expect(await CategoryModel.exists({ _id: web._id })).toBeTruthy();
  });

  it("delete is blocked when a project uses a child category", async () => {
    const child = await CategoryModel.create({ ...fields, parentId: web._id });
    await createProjectIn(child._id);
    const res = await admin.delete(`/api/admin/category/remove/${web._id}`);
    expect(res.status).toBe(409);
    expect(await CategoryModel.countDocuments({ englishTitle: { $in: ["web", "frontend"] } })).toBe(2);
  });
});

describe("escapeRegex", () => {
  it("makes every regex character match literally", () => {
    const text = "a.b*c+d?e^f$g{h}i(j)k|l[m]n\\o";
    expect(new RegExp(`^${escapeRegex(text)}$`).test(text)).toBe(true);
    expect(escapeRegex(undefined)).toBe("");
  });
});

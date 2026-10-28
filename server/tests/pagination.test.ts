import type { Express } from "express";
import { startApp, stopApp, clearDb, createUser, createCategory, type TestUser } from "./helpers";
import { UserModel } from "../app/models/user";
import { ProjectModel } from "../app/models/project";
import { ProposalModel } from "../app/models/proposal";
import { ERROR_CODES } from "../utils/errorCodes";
import { LIMITS } from "../utils/constants";

let app: Express, owner: TestUser, freelancer: TestUser, admin: TestUser;
let projectIds: string[];

const COUNT = 12;
const lists = ["/api/project/list", "/api/project/owner-projects", "/api/proposal/list", "/api/admin/user/list"];

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);
beforeEach(async () => {
  await clearDb();
  owner = await createUser(app, { phoneNumber: "09120000051", role: "OWNER" });
  freelancer = await createUser(app, { phoneNumber: "09120000052", role: "FREELANCER" });
  admin = await createUser(app, { phoneNumber: "09120000053", role: "ADMIN" });
  const category = await createCategory();
  const projects = await ProjectModel.create(
    Array.from({ length: COUNT }, (_, i) => ({
      title: `Project number ${i}`,
      description: "Build it",
      category: category._id,
      deadline: "2030-01-01",
      budget: 1000000,
      owner: owner.user._id,
    }))
  );
  projectIds = projects.map((p) => String(p._id));
  await ProposalModel.create(
    projects.map((p) => ({ description: "I can do it", price: 1, duration: 1, user: freelancer.user._id, project: p._id }))
  );
  await UserModel.create(Array.from({ length: COUNT }, (_, i) => ({ phoneNumber: `091300000${String(i).padStart(2, "0")}` })));
});

// the admin sees every list (owner-projects only its own, so the owner calls that one)
const agentFor = (url: string) => (url.includes("owner-projects") ? owner.agent : admin.agent);

describe("pagination", () => {
  it.each(lists)("%s defaults to page 1", async (url) => {
    const res = await agentFor(url).get(url).expect(200);
    expect(res.body.data).toMatchObject({ page: 1, limit: LIMITS.PAGE_SIZE });
    expect(res.body.data.items).toHaveLength(LIMITS.PAGE_SIZE);
    expect(res.body.data.total).toBeGreaterThanOrEqual(COUNT);
  });

  it.each(lists)("%s returns an empty page past the end, with the total", async (url) => {
    const res = await agentFor(url).get(`${url}?page=50`).expect(200);
    expect(res.body.data).toMatchObject({ items: [], page: 50, limit: LIMITS.PAGE_SIZE });
    expect(res.body.data.total).toBeGreaterThanOrEqual(COUNT);
  });

  it.each(lists)("%s accepts the max limit", async (url) => {
    const res = await agentFor(url).get(`${url}?limit=${LIMITS.PAGE_SIZE_MAX}`).expect(200);
    expect(res.body.data.items).toHaveLength(res.body.data.total);
  });

  it("pages don't overlap and follow the sort", async () => {
    const pages = await Promise.all(
      [1, 2, 3].map((page) => owner.agent.get(`/api/project/owner-projects?sort=earliest&limit=5&page=${page}`))
    );
    const ids = pages.flatMap((res) => res.body.data.items.map((p: { _id: string }) => p._id));
    expect(ids).toEqual(projectIds);
    expect(pages.map((res) => res.body.data.total)).toEqual([COUNT, COUNT, COUNT]);
  });

  it("counts every user, not only the first page", async () => {
    await UserModel.create(Array.from({ length: 20 }, (_, i) => ({ phoneNumber: `091400000${String(i).padStart(2, "0")}` })));
    const res = await admin.agent.get("/api/admin/user/list").expect(200);
    expect(res.body.data.total).toBe(3 + COUNT + 20);
  });

  const invalid = ["page=0", "page=-1", "page=1.5", "page=x", "page=1&page=2", "limit=0", "limit=ten", `limit=${LIMITS.PAGE_SIZE_MAX + 1}`];
  it.each(lists.flatMap((url) => invalid.map((query) => [url, query])))("%s?%s is rejected", async (url, query) => {
    const res = await agentFor(url).get(`${url}?${query}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      statusCode: 400,
      code: ERROR_CODES.INVALID_PAGINATION,
      message: "صفحه بندی صحیح نمی باشد",
      field: query.split("=")[0],
    });
  });
});

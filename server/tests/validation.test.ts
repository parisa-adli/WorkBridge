import type { Express } from "express";
import { startApp, stopApp, clearDb, createUser, type TestUser } from "./helpers";
import { ERROR_CODES } from "../utils/errorCodes";
import { LIMITS } from "../utils/constants";

let app: Express, admin: TestUser;

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);
beforeEach(async () => {
  await clearDb();
  admin = await createUser(app, { phoneNumber: "09120000041", role: "ADMIN" });
});

// Validation runs before any lookup, so a well-formed id needs no document behind it.
const ID = "0123456789abcdef01234567";
const project = {
  title: "Landing page",
  description: "Build a landing page",
  tags: ["react"],
  category: ID,
  budget: 1000000,
  deadline: "2030-01-01",
};
const proposal = { description: "I can do it", price: 500000, duration: 10, projectId: ID };
const category = { title: "دسته وب", englishTitle: "web", description: "category", type: "project" };

const invalidId = [ERROR_CODES.INVALID_ID, "شناسه ارسال شده صحیح نمیباشد"] as const;
const projectStatus = [ERROR_CODES.INVALID_PROJECT_STATUS, "وضعیت پروژه صحیح نمیباشد"] as const;
const proposalStatus = [ERROR_CODES.INVALID_PROPOSAL_STATUS, "وضعیت پروپوزال صحیح نمی باشد"] as const;
const userStatus = [ERROR_CODES.INVALID_USER_STATUS, "وضعیت کاربر صحیح نمی باشد"] as const;
const title = [ERROR_CODES.INVALID_PROJECT_TITLE, "عنوان محصول صحیح نمیباشد"] as const;
const description = [ERROR_CODES.INVALID_DESCRIPTION, "توضیحات ارسال شده صحیح نمیباشد"] as const;
const price = [ERROR_CODES.INVALID_PRICE, "قیمت وارد شده صحیح نمیباشد"] as const;
const duration = [ERROR_CODES.INVALID_DURATION, " زمان انجام پروژه را وارد کنید"] as const;
const sort = [ERROR_CODES.INVALID_SORT, "ترتیب نمایش صحیح نمی باشد"] as const;
const search = [ERROR_CODES.INVALID_SEARCH, "عبارت جستجو صحیح نمی باشد"] as const;
const page = [ERROR_CODES.INVALID_PAGINATION, "صفحه بندی صحیح نمی باشد"] as const;
const categoryType = [ERROR_CODES.INVALID_CATEGORY_TYPE, "نوع دسته بندی صحیح نمی باشد"] as const;

type Case = [string, string, Record<string, unknown> | null, string, string, string];

// Every route with input validates it with Zod: 400, the first failing field, its code and the Persian message.
const cases: Case[] = [
  // project
  ["post", "/api/project/add", { ...project, title: "x".repeat(LIMITS.PROJECT_TITLE_MIN - 1) }, "title", ...title],
  ["post", "/api/project/add", { ...project, title: "x".repeat(LIMITS.PROJECT_TITLE_MAX + 1) }, "title", ...title],
  ["post", "/api/project/add", { ...project, description: "x".repeat(LIMITS.PROJECT_DESCRIPTION_MIN - 1) }, "description", ...description],
  ["post", "/api/project/add", { ...project, tags: Array(LIMITS.PROJECT_TAGS_MAX + 1).fill("t") }, "tags", ERROR_CODES.INVALID_TAGS, "برچسب ها نمیتواند بیشتر از 20 ایتم باشد"],
  ["post", "/api/project/add", { ...project, category: "nope" }, "category", ERROR_CODES.INVALID_CATEGORY, "دسته بندی مورد نظر  صحیح نمی باشد"],
  ["post", "/api/project/add", { ...project, budget: LIMITS.PROJECT_BUDGET_MIN - 1 }, "budget", ...price],
  ["post", "/api/project/add", { ...project, budget: "" }, "budget", ...price],
  ["post", "/api/project/add", { ...project, deadline: "not a date" }, "deadline", ERROR_CODES.INVALID_DEADLINE, "ددلاین پروژه را وارد کنید"],
  ["post", "/api/project/add", { ...project, deadline: undefined }, "deadline", ERROR_CODES.INVALID_DEADLINE, "ددلاین پروژه را وارد کنید"],
  ["patch", "/api/project/update/123", project, "id", ...invalidId],
  ["patch", `/api/project/update/${ID}`, { ...project, title: undefined }, "title", ...title],
  ["patch", `/api/project/${ID}`, { status: "DONE" }, "status", ...projectStatus],
  ["patch", "/api/project/123", { status: "OPEN" }, "id", ...invalidId],
  ["get", "/api/project/123", null, "id", ...invalidId],
  ["delete", "/api/project/123", null, "id", ...invalidId],
  ["get", "/api/project/list?status=DONE", null, "status", ...projectStatus],
  ["get", "/api/project/list?sort=latest&sort=earliest", null, "sort", ...sort],
  ["get", "/api/project/list?search=a&search=b", null, "search", ...search],
  ["get", "/api/project/owner-projects?status=DONE", null, "status", ...projectStatus],
  // proposal
  ["post", "/api/proposal/add", { ...proposal, description: "x".repeat(LIMITS.PROPOSAL_DESCRIPTION_MIN - 1) }, "description", ...description],
  ["post", "/api/proposal/add", { ...proposal, price: LIMITS.PROPOSAL_PRICE_MAX + 1 }, "price", ...price],
  ["post", "/api/proposal/add", { ...proposal, duration: LIMITS.PROPOSAL_DURATION_MAX + 1 }, "duration", ...duration],
  ["post", "/api/proposal/add", { ...proposal, duration: "abc" }, "duration", ...duration],
  ["post", "/api/proposal/add", { ...proposal, projectId: "123" }, "projectId", ERROR_CODES.INVALID_PROJECT_ID, "شناسه پروژه وارد شده صحیح نمیباشد"],
  ["patch", `/api/proposal/${ID}`, { status: 3 }, "status", ...proposalStatus],
  ["patch", `/api/proposal/${ID}`, {}, "status", ...proposalStatus],
  ["patch", "/api/proposal/123", { status: 2 }, "id", ...invalidId],
  ["get", "/api/proposal/123", null, "id", ...invalidId],
  ["get", "/api/proposal/list?sort=a&sort=b", null, "sort", ...sort],
  // category
  ["get", "/api/category/123", null, "id", ...invalidId],
  ["get", "/api/category/list?type=product", null, "type", ...categoryType],
  ["post", "/api/admin/category/add", { ...category, title: "ab" }, "title", ERROR_CODES.INVALID_CATEGORY_TITLE, "عنوان فارسی دسته بندی صحیح نمیباشد"],
  ["post", "/api/admin/category/add", { ...category, englishTitle: undefined }, "englishTitle", ERROR_CODES.INVALID_CATEGORY_ENGLISH_TITLE, "عنوان انگلیسی دسته بندی صیحیح نمی باشد"],
  ["post", "/api/admin/category/add", { ...category, description: "x".repeat(201) }, "description", ERROR_CODES.INVALID_CATEGORY_DESCRIPTION, "توضیحات دسته بندی صحیح نمی باشد"],
  ["post", "/api/admin/category/add", { ...category, type: "product" }, "type", ...categoryType],
  ["post", "/api/admin/category/add", { ...category, parent: "123" }, "parent", ...invalidId],
  ["patch", `/api/admin/category/update/${ID}`, { ...category, type: undefined }, "type", ...categoryType],
  ["patch", "/api/admin/category/update/123", category, "id", ...invalidId],
  ["delete", "/api/admin/category/remove/123", null, "id", ...invalidId],
  // admin users
  ["patch", `/api/admin/user/verify/${ID}`, { status: "x" }, "status", ...userStatus],
  ["patch", "/api/admin/user/verify/123", { status: 2 }, "userId", ...invalidId],
  ["get", "/api/admin/user/profile/123", null, "userId", ...invalidId],
  ["get", "/api/admin/user/list?page=0", null, "page", ...page],
  ["get", "/api/admin/user/list?limit=ten", null, "limit", ...page],
  ["get", "/api/admin/user/list?search=a&search=b", null, "search", ...search],
];

describe("validation errors", () => {
  it.each(cases)("%s %s %j fails on %s", async (method, url, body, field, code, message) => {
    const req = admin.agent[method as "get" | "post" | "patch" | "delete"](url);
    const res = await (body ? req.send(body) : req);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, code, message, field });
  });
});

describe("valid input", () => {
  it("reads numeric strings from forms as numbers", async () => {
    const res = await admin.agent.post("/api/project/add").send({ ...project, budget: "1000000" });
    // passes validation and reaches the controller, which saves the number
    expect(res.status).toBe(201);
    expect(res.body.data.project.budget).toBe(1000000);
  });

  it("accepts the list filters the client sends", async () => {
    for (const query of ["?status=ALL&sort=latest&category=ALL&search=x", "?status=OPEN&sort=earliest"])
      expect((await admin.agent.get(`/api/project/list${query}`)).status).toBe(200);
    expect((await admin.agent.get("/api/admin/user/list?page=2&limit=10&search=x")).status).toBe(200);
  });
});

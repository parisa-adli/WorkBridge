const request = require("supertest");
const { startApp, stopApp, clearDb, createCategory } = require("./helpers");
const { escapeRegex } = require("../utils/functions");

let app;

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);
beforeEach(async () => {
  await clearDb();
  await createCategory("web");
  await createCategory("mobile");
});

const list = (query) => request(app).get(`/api/category/list${query}`);
const titles = (res) => res.body.data.categories.map((c) => c.englishTitle).sort();

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

describe("escapeRegex", () => {
  it("makes every regex character match literally", () => {
    const text = "a.b*c+d?e^f$g{h}i(j)k|l[m]n\\o";
    expect(new RegExp(`^${escapeRegex(text)}$`).test(text)).toBe(true);
    expect(escapeRegex(undefined)).toBe("");
  });
});

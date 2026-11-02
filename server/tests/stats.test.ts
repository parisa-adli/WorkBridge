import type { Express } from "express";
import type mongoose from "mongoose";
import request from "supertest";
import { startApp, stopApp, clearDb, createCategory } from "./helpers";
import { CategoryModel } from "../app/models/category";
import { ProjectModel } from "../app/models/project";
import { UserModel } from "../app/models/user";

let app: Express;

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);
beforeEach(clearDb);

describe("GET /api/stats/public", () => {
  it("counts verified freelancers and owners, open projects and projects per category, without auth", async () => {
    const [owner] = await UserModel.create([
      { role: "OWNER", status: 2 },
      { role: "OWNER", status: 1 }, // pending: not counted
      { role: "FREELANCER", status: 2 },
      { role: "FREELANCER", status: 2 },
      { role: "FREELANCER", status: 0 }, // rejected: not counted
      { role: "ADMIN", status: 2 },
    ]);
    const web = await createCategory("web");
    const mobile = await createCategory("mobile");
    await CategoryModel.create({ title: "تیکت", englishTitle: "ticket", description: "x", type: "ticket" });
    const project = (category: mongoose.Types.ObjectId, status: "OPEN" | "CLOSED" = "OPEN") => ({
      title: "project",
      description: "description",
      category,
      budget: 1000,
      deadline: new Date(),
      owner: owner._id,
      status,
    });
    await ProjectModel.create([project(web._id), project(web._id, "CLOSED"), project(web._id)]);
    // awaiting approval or rejected: hidden, so not counted
    await ProjectModel.create([{ ...project(web._id), approval: 1 }, { ...project(mobile._id), approval: 0 }]);

    const res = await request(app).get("/api/stats/public");
    expect(res.status).toBe(200);
    const { categories, ...counts } = res.body.data;
    expect(counts).toEqual({ freelancers: 2, owners: 1, openProjects: 2 });
    // only project categories, each with all its projects (open or closed), zero included
    expect(
      categories.map((c: { englishTitle: string; projects: number }) => [c.englishTitle, c.projects]).sort()
    ).toEqual([
      ["mobile", 0],
      ["web", 3],
    ]);
    expect(categories.find((c: { _id: string }) => c._id === String(mobile._id)).title).toBe(mobile.title);
  });

  it("lists only the 8 categories with the most projects, most first", async () => {
    const [owner] = await UserModel.create([{ role: "OWNER", status: 2 }]);
    const categories = [];
    for (let i = 0; i < 9; i++) categories.push(await createCategory(`c${i}`));
    // category ci gets i projects, so c0 (none) drops out
    await ProjectModel.create(
      categories.flatMap((c, i) =>
        Array.from({ length: i }, () => ({
          title: "project",
          description: "description",
          category: c._id,
          budget: 1000,
          deadline: new Date(),
          owner: owner._id,
        }))
      )
    );

    const res = await request(app).get("/api/stats/public");
    expect(res.body.data.categories.map((c: { englishTitle: string }) => c.englishTitle)).toEqual(
      ["c8", "c7", "c6", "c5", "c4", "c3", "c2", "c1"]
    );
  });

  it("answers zeros on an empty database", async () => {
    const res = await request(app).get("/api/stats/public");
    expect(res.body.data).toEqual({ freelancers: 0, owners: 0, openProjects: 0, categories: [] });
  });
});

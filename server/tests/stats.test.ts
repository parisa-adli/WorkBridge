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

  it("answers zeros on an empty database", async () => {
    const res = await request(app).get("/api/stats/public");
    expect(res.body.data).toEqual({ freelancers: 0, owners: 0, openProjects: 0, categories: [] });
  });
});

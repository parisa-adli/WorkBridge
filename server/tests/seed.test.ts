import request from "supertest";
import type { Express } from "express";
import { startApp, stopApp, clearDb } from "./helpers";
import { seedDemoData } from "../utils/seedDemoData";
import { DEMO_USERS, STATUS } from "../utils/constants";
import { UserModel } from "../app/models/user";
import { CategoryModel } from "../app/models/category";
import { ProjectModel } from "../app/models/project";
import { ProposalModel } from "../app/models/proposal";

let app: Express;

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);
beforeEach(clearDb);

const counts = async () => ({
  users: await UserModel.countDocuments(),
  categories: await CategoryModel.countDocuments(),
  projects: await ProjectModel.countDocuments(),
  proposals: await ProposalModel.countDocuments(),
});

describe("seedDemoData", () => {
  it("is idempotent", async () => {
    await seedDemoData();
    const first = await counts();
    expect(first).toEqual({ users: 3, categories: 3, projects: 3, proposals: 3 });

    await seedDemoData();
    expect(await counts()).toEqual(first);
    const projects = await ProjectModel.find();
    expect(projects.every((p) => p.proposals.length === 1)).toBe(true);
  });

  it("creates verified demo accounts with bcrypt-hashed passwords", async () => {
    await seedDemoData();
    for (const [role, { username, email, password }] of Object.entries(DEMO_USERS)) {
      const user = (await UserModel.findOne({ username }))!;
      expect(user).toMatchObject({ role, email, status: STATUS.ACCEPTED, isActive: true });
      expect(user.password).toMatch(/^\$2[aby]\$10\$/);
      expect(user.password).not.toContain(password);
    }
  });

  it("returns translations.en from the API", async () => {
    await seedDemoData();
    const agent = request.agent(app);
    const { username, password } = DEMO_USERS.OWNER;
    await agent.post("/api/user/demo-login").send({ username, password }).expect(200);

    const res = await agent.get("/api/project/owner-projects").expect(200);
    const project = res.body.data.projects.find((p: { title: string }) => p.title === "طراحی لوگوی استارتاپ");
    expect(project.translations.en).toEqual({
      title: "Startup logo design",
      description: "We want a logo and a color guide for an education startup.",
      tags: ["Logo", "Branding"],
    });
    expect(project.owner.translations.en.name).toBe("Demo Owner");

    const single = await agent.get(`/api/project/${project._id}`).expect(200);
    expect(single.body.data.project.proposals[0].translations.en.description).toMatch(/three drafts/);
    expect(single.body.data.project.proposals[0].user.translations.en.name).toBe("Demo Freelancer");
  });

  it("drops the English version when the owner edits a project", async () => {
    await seedDemoData();
    const agent = request.agent(app);
    const { username, password } = DEMO_USERS.OWNER;
    await agent.post("/api/user/demo-login").send({ username, password }).expect(200);
    const project = (await ProjectModel.findOne({ title: "طراحی لوگوی استارتاپ" }))!;

    await agent
      .patch(`/api/project/update/${project._id}`)
      .send({
        title: "طراحی لوگوی جدید استارتاپ",
        description: project.description,
        tags: project.tags,
        budget: project.budget,
        deadline: project.deadline,
        category: String(project.category),
      })
      .expect(200);
    // toObject() minimizes the empty nested path Mongoose hydrates
    expect((await ProjectModel.findById(project._id))!.toObject().translations).toBeUndefined();
  });
});

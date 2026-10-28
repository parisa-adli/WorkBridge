import type { Express } from "express";
import type mongoose from "mongoose";
import { startApp, stopApp, clearDb, createUser, createCategory, type TestUser } from "./helpers";
import { ProjectModel } from "../app/models/project";
import { ProposalModel } from "../app/models/proposal";

let app: Express, owner: TestUser, otherOwner: TestUser, freelancer: TestUser, admin: TestUser;
let category: { _id: unknown };

const projectBody = () => ({
  title: "Landing page",
  description: "Build a landing page",
  tags: ["react"],
  category: String(category._id),
  budget: 1000000,
  deadline: "2030-01-01",
});

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);
beforeEach(async () => {
  await clearDb();
  owner = await createUser(app, { phoneNumber: "09120000011", role: "OWNER" });
  otherOwner = await createUser(app, { phoneNumber: "09120000012", role: "OWNER" });
  freelancer = await createUser(app, { phoneNumber: "09120000013", role: "FREELANCER" });
  admin = await createUser(app, { phoneNumber: "09120000014", role: "ADMIN" });
  category = await createCategory();
});

const addProject = async (agent = owner.agent, body = projectBody()) =>
  (await agent.post("/api/project/add").send(body).expect(201)).body.data.project;

describe("POST /api/project/add", () => {
  it("creates an OPEN project owned by the caller", async () => {
    const res = await owner.agent.post("/api/project/add").send(projectBody());

    expect(res.status).toBe(201);
    expect(res.body.data.message).toBe("پروژه با موفقیت ایجاد شد");
    expect(res.body.data.project).toMatchObject({
      title: "Landing page",
      status: "OPEN",
      owner: String(owner.user._id),
      freelancer: null,
      proposals: [],
    });
  });

  it("forbids freelancers", async () => {
    const res = await freelancer.agent.post("/api/project/add").send(projectBody());
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("شما به این قسمت دسترسی ندارید");
  });

  it("rejects a title longer than 30 characters", async () => {
    const res = await owner.agent.post("/api/project/add").send({ ...projectBody(), title: "x".repeat(31) });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("عنوان محصول صحیح نمیباشد");
  });

  it("rejects a title shorter than 10 characters", async () => {
    const res = await owner.agent.post("/api/project/add").send({ ...projectBody(), title: "x".repeat(9) });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("عنوان محصول صحیح نمیباشد");
  });

  it.each([99999, 1000000001])("rejects a budget of %d", async (budget) => {
    const res = await owner.agent.post("/api/project/add").send({ ...projectBody(), budget });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("قیمت وارد شده صحیح نمیباشد");
  });

  it("rejects a project without budget with 400", async () => {
    const { budget, ...body } = projectBody();
    const res = await owner.agent.post("/api/project/add").send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("قیمت وارد شده صحیح نمیباشد");
  });

  it("rejects an invalid category id", async () => {
    const res = await owner.agent.post("/api/project/add").send({ ...projectBody(), category: "nope" });
    expect(res.status).toBe(400);
  });
});

describe("GET project lists", () => {
  it("/list filters by status, names the owner and hides freelancer and proposals", async () => {
    const open = await addProject();
    const closed = await addProject(otherOwner.agent);
    await otherOwner.agent.patch(`/api/project/${closed._id}`).send({ status: "CLOSED" }).expect(200);

    const res = await freelancer.agent.get("/api/project/list?status=OPEN");

    expect(res.status).toBe(200);
    expect(res.body.data.items.map((p: { _id: string }) => p._id)).toEqual([open._id]);
    const [p] = res.body.data.items;
    expect(p.owner).toMatchObject({ _id: String(owner.user._id), name: owner.user.name });
    expect(p.freelancer).toBeUndefined();
    expect(p.proposals).toBeUndefined();
    expect(p.category).toMatchObject({ englishTitle: "web" });
  });

  it("/list?search matches the title, case-insensitively", async () => {
    const match = await addProject();
    await addProject(owner.agent, { ...projectBody(), title: "Mobile app" });

    const res = await freelancer.agent.get("/api/project/list?search=LANDING");

    expect(res.status).toBe(200);
    expect(res.body.data.items.map((p: { _id: string }) => p._id)).toEqual([match._id]);
  });

  it("/list?search treats regex characters literally", async () => {
    const match = await addProject(owner.agent, { ...projectBody(), title: "C++ (v2) app" });
    await addProject();

    const res = await freelancer.agent.get(`/api/project/list?search=${encodeURIComponent("++ (")}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.map((p: { _id: string }) => p._id)).toEqual([match._id]);

    const dot = await freelancer.agent.get("/api/project/list?search=.*");
    expect(dot.body.data.items).toEqual([]);
  });

  it("/owner-projects returns only the caller's projects", async () => {
    const mine = await addProject();
    await addProject(otherOwner.agent);

    const res = await owner.agent.get("/api/project/owner-projects");

    expect(res.status).toBe(200);
    expect(res.body.data.items.map((p: { _id: string }) => p._id)).toEqual([mine._id]);
    expect(res.body.data.items[0].owner.name).toBe("user 09120000011");
  });

  it("/owner-projects shares the /list filters and sorts", async () => {
    const first = await addProject();
    const second = await addProject();
    // raw driver write: mongoose timestamps would ignore a createdAt update
    await ProjectModel.collection.updateOne({ _id: new ProjectModel.base.Types.ObjectId(first._id) }, { $set: { createdAt: new Date("2020-01-01") } });
    const latest = await owner.agent.get("/api/project/owner-projects?sort=latest&category=web");
    expect(latest.body.data.items.map((p: { _id: string }) => p._id)).toEqual([second._id, first._id]);

    // sort=popular is gone: it falls back to oldest first
    const popular = await owner.agent.get("/api/project/owner-projects?sort=popular");
    expect(popular.body.data.items.map((p: { _id: string }) => p._id)).toEqual([first._id, second._id]);

  });

  it.each(["?category=nope", "?category=web,nope", "?category=web&category=mobile"])(
    "/owner-projects%s returns 400 instead of crashing",
    async (query) => {
      const res = await owner.agent.get(`/api/project/owner-projects${query}`);
      expect(res.status).toBe(400);
    }
  );
});

describe("PATCH /api/project/update/:id", () => {
  it("updates the project", async () => {
    const project = await addProject();
    const res = await owner.agent
      .patch(`/api/project/update/${project._id}`)
      .send({ ...projectBody(), title: "New project title" });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("به روز رسانی با موفقیت انجام شد");
    expect((await ProjectModel.findById(project._id))!.title).toBe("New project title");
  });

  it("succeeds when nothing changed (timestamps bump updatedAt, so modifiedCount is never 0)", async () => {
    const project = await addProject();
    const res = await owner.agent.patch(`/api/project/update/${project._id}`).send(projectBody());
    expect(res.status).toBe(200);
  });

  it("returns its own 500 message when the update writes nothing (was a ReferenceError)", async () => {
    const project = await addProject();
    vi.spyOn(ProjectModel, "updateOne").mockResolvedValueOnce({ modifiedCount: 0 } as mongoose.UpdateWriteOpResult);
    const res = await owner.agent.patch(`/api/project/update/${project._id}`).send(projectBody());
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("به روزرسانی انجام نشد");
  });

  it("returns 400 for a malformed id", async () => {
    const res = await owner.agent.patch("/api/project/update/123").send(projectBody());
    expect(res.status).toBe(400);
  });

  it("forbids a different owner from editing the project", async () => {
    const project = await addProject();
    const res = await otherOwner.agent
      .patch(`/api/project/update/${project._id}`)
      .send({ ...projectBody(), title: "Hijacked title" });
    expect(res.status).toBe(403);
    expect((await ProjectModel.findById(project._id))!.title).toBe("Landing page");
  });

  it("lets an admin edit any project", async () => {
    const project = await addProject();
    const res = await admin.agent
      .patch(`/api/project/update/${project._id}`)
      .send({ ...projectBody(), title: "Edited by admin" });
    expect(res.status).toBe(200);
    expect((await ProjectModel.findById(project._id))!.title).toBe("Edited by admin");
  });
});

describe("PATCH /api/project/:id (open/close)", () => {
  it("closes and reopens the project", async () => {
    const project = await addProject();

    const closed = await owner.agent.patch(`/api/project/${project._id}`).send({ status: "CLOSED" });
    expect(closed.status).toBe(200);
    expect(closed.body.data.message).toBe("پروژه بسته شد");
    expect((await ProjectModel.findById(project._id))!.status).toBe("CLOSED");

    const opened = await owner.agent.patch(`/api/project/${project._id}`).send({ status: "OPEN" });
    expect(opened.body.data.message).toBe("وضعیت پروژه به حالت باز تغییر یافت");
    expect((await ProjectModel.findById(project._id))!.status).toBe("OPEN");
  });

  it("succeeds when setting the current status again", async () => {
    const project = await addProject();
    const res = await owner.agent.patch(`/api/project/${project._id}`).send({ status: "OPEN" });
    expect(res.status).toBe(200);
  });

  it.each([{ status: "DONE" }, {}])("rejects an invalid status %o with 400", async (body) => {
    const project = await addProject();
    const res = await owner.agent.patch(`/api/project/${project._id}`).send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("وضعیت پروژه صحیح نمیباشد");
    expect((await ProjectModel.findById(project._id).lean())!.status).toBe("OPEN");
  });

  it("forbids a different owner from closing the project", async () => {
    const project = await addProject();
    const res = await otherOwner.agent.patch(`/api/project/${project._id}`).send({ status: "CLOSED" });
    expect(res.status).toBe(403);
    expect((await ProjectModel.findById(project._id))!.status).toBe("OPEN");
  });

  it("lets an admin close any project", async () => {
    const project = await addProject();
    const res = await admin.agent.patch(`/api/project/${project._id}`).send({ status: "CLOSED" });
    expect(res.status).toBe(200);
    expect((await ProjectModel.findById(project._id))!.status).toBe("CLOSED");
  });
});

describe("GET and DELETE /api/project/:id", () => {
  it("gets a project with category and owner populated", async () => {
    const project = await addProject();
    const res = await owner.agent.get(`/api/project/${project._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.project).toMatchObject({
      category: { englishTitle: "web" },
      owner: { name: "user 09120000011" },
      proposals: [],
    });
  });

  it("forbids a different owner from reading or deleting the project", async () => {
    const project = await addProject();
    expect((await otherOwner.agent.get(`/api/project/${project._id}`)).status).toBe(403);
    expect((await otherOwner.agent.delete(`/api/project/${project._id}`)).status).toBe(403);
    expect(await ProjectModel.findById(project._id))!.not.toBeNull();
  });

  it("lets an admin read and delete any project", async () => {
    const project = await addProject();
    expect((await admin.agent.get(`/api/project/${project._id}`)).status).toBe(200);
    expect((await admin.agent.delete(`/api/project/${project._id}`)).status).toBe(200);
    expect(await ProjectModel.findById(project._id))!.toBeNull();
  });

  it("deletes a project without a freelancer", async () => {
    const project = await addProject();
    const res = await owner.agent.delete(`/api/project/${project._id}`);
    expect(res.status).toBe(200);
    expect(await ProjectModel.findById(project._id))!.toBeNull();
  });

  it("deletes the project's proposals with it, and no others", async () => {
    const project = await addProject();
    const other = await addProject();
    for (const { _id } of [project, other])
      await freelancer.agent
        .post("/api/proposal/add")
        .send({ description: "I can do it", price: 500000, duration: 10, projectId: String(_id) })
        .expect(201);

    await owner.agent.delete(`/api/project/${project._id}`).expect(200);

    expect(await ProposalModel.countDocuments({ project: project._id })).toBe(0);
    expect(await ProposalModel.countDocuments({ project: other._id })).toBe(1);
  });

  it("responds 404 instead of hanging when the delete removes nothing", async () => {
    const project = await addProject();
    vi.spyOn(ProjectModel, "deleteOne").mockResolvedValueOnce({ deletedCount: 0 } as mongoose.mongo.DeleteResult);
    const res = await owner.agent.delete(`/api/project/${project._id}`);
    expect(res.status).toBe(404);
  });

  it("refuses to delete a project that has a freelancer", async () => {
    const project = await addProject();
    await ProjectModel.updateOne({ _id: project._id }, { freelancer: freelancer.user._id });
    const res = await owner.agent.delete(`/api/project/${project._id}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("پروژه قابل حذف نیست");
  });
});

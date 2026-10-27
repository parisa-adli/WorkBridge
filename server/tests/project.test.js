const { startApp, stopApp, clearDb, createUser, createCategory } = require("./helpers");
const { ProjectModel } = require("../app/models/project");

let app, owner, otherOwner, freelancer, admin, category;

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

  it("returns 500 without budget (optional in Joi, required in the model)", async () => {
    const { budget, ...body } = projectBody();
    const res = await owner.agent.post("/api/project/add").send(body);
    expect(res.status).toBe(500);
  });

  it("rejects an invalid category id", async () => {
    const res = await owner.agent.post("/api/project/add").send({ ...projectBody(), category: "nope" });
    expect(res.status).toBe(400);
  });
});

describe("GET project lists", () => {
  it("/list filters by status and hides owner, freelancer and proposals", async () => {
    const open = await addProject();
    const closed = await addProject(otherOwner.agent);
    await otherOwner.agent.patch(`/api/project/${closed._id}`).send({ status: "CLOSED" }).expect(200);

    const res = await freelancer.agent.get("/api/project/list?status=OPEN");

    expect(res.status).toBe(200);
    expect(res.body.data.projects.map((p) => p._id)).toEqual([open._id]);
    const [p] = res.body.data.projects;
    expect(p.owner).toBeUndefined();
    expect(p.freelancer).toBeUndefined();
    expect(p.proposals).toBeUndefined();
    expect(p.category).toMatchObject({ englishTitle: "web" });
  });

  it("/list?search fails with 500 because Project has no text index", async () => {
    await addProject();
    const res = await freelancer.agent.get("/api/project/list?search=landing");
    expect(res.status).toBe(500);
  });

  it("/owner-projects returns only the caller's projects", async () => {
    const mine = await addProject();
    await addProject(otherOwner.agent);

    const res = await owner.agent.get("/api/project/owner-projects");

    expect(res.status).toBe(200);
    expect(res.body.data.projects.map((p) => p._id)).toEqual([mine._id]);
    expect(res.body.data.projects[0].owner.name).toBe("user 09120000011");
  });
});

describe("PATCH /api/project/update/:id", () => {
  it("updates the project", async () => {
    const project = await addProject();
    const res = await owner.agent
      .patch(`/api/project/update/${project._id}`)
      .send({ ...projectBody(), title: "New title" });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("به روز رسانی با موفقیت انجام شد");
    expect((await ProjectModel.findById(project._id)).title).toBe("New title");
  });

  it("succeeds when nothing changed (timestamps bump updatedAt, so modifiedCount is never 0)", async () => {
    const project = await addProject();
    const res = await owner.agent.patch(`/api/project/update/${project._id}`).send(projectBody());
    expect(res.status).toBe(200);
  });

  it("returns 400 for a malformed id", async () => {
    const res = await owner.agent.patch("/api/project/update/123").send(projectBody());
    expect(res.status).toBe(400);
  });

  it("forbids a different owner from editing the project", async () => {
    const project = await addProject();
    const res = await otherOwner.agent
      .patch(`/api/project/update/${project._id}`)
      .send({ ...projectBody(), title: "Hijacked" });
    expect(res.status).toBe(403);
    expect((await ProjectModel.findById(project._id)).title).toBe("Landing page");
  });

  it("lets an admin edit any project", async () => {
    const project = await addProject();
    const res = await admin.agent
      .patch(`/api/project/update/${project._id}`)
      .send({ ...projectBody(), title: "By admin" });
    expect(res.status).toBe(200);
    expect((await ProjectModel.findById(project._id)).title).toBe("By admin");
  });
});

describe("PATCH /api/project/:id (open/close)", () => {
  it("closes and reopens the project", async () => {
    const project = await addProject();

    const closed = await owner.agent.patch(`/api/project/${project._id}`).send({ status: "CLOSED" });
    expect(closed.status).toBe(200);
    expect(closed.body.data.message).toBe("پروژه بسته شد");
    expect((await ProjectModel.findById(project._id)).status).toBe("CLOSED");

    const opened = await owner.agent.patch(`/api/project/${project._id}`).send({ status: "OPEN" });
    expect(opened.body.data.message).toBe("وضعیت پروژه به حالت باز تغییر یافت");
    expect((await ProjectModel.findById(project._id)).status).toBe("OPEN");
  });

  it("succeeds when setting the current status again", async () => {
    const project = await addProject();
    const res = await owner.agent.patch(`/api/project/${project._id}`).send({ status: "OPEN" });
    expect(res.status).toBe(200);
  });

  it("saves an invalid status value (updateOne skips enum validation)", async () => {
    const project = await addProject();
    const res = await owner.agent.patch(`/api/project/${project._id}`).send({ status: "DONE" });
    expect(res.status).toBe(200);
    expect((await ProjectModel.findById(project._id).lean()).status).toBe("DONE");
  });

  it("forbids a different owner from closing the project", async () => {
    const project = await addProject();
    const res = await otherOwner.agent.patch(`/api/project/${project._id}`).send({ status: "CLOSED" });
    expect(res.status).toBe(403);
    expect((await ProjectModel.findById(project._id)).status).toBe("OPEN");
  });

  it("lets an admin close any project", async () => {
    const project = await addProject();
    const res = await admin.agent.patch(`/api/project/${project._id}`).send({ status: "CLOSED" });
    expect(res.status).toBe(200);
    expect((await ProjectModel.findById(project._id)).status).toBe("CLOSED");
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
    expect(await ProjectModel.findById(project._id)).not.toBeNull();
  });

  it("lets an admin read and delete any project", async () => {
    const project = await addProject();
    expect((await admin.agent.get(`/api/project/${project._id}`)).status).toBe(200);
    expect((await admin.agent.delete(`/api/project/${project._id}`)).status).toBe(200);
    expect(await ProjectModel.findById(project._id)).toBeNull();
  });

  it("deletes a project without a freelancer", async () => {
    const project = await addProject();
    const res = await owner.agent.delete(`/api/project/${project._id}`);
    expect(res.status).toBe(200);
    expect(await ProjectModel.findById(project._id)).toBeNull();
  });

  it("refuses to delete a project that has a freelancer", async () => {
    const project = await addProject();
    await ProjectModel.updateOne({ _id: project._id }, { freelancer: freelancer.user._id });
    const res = await owner.agent.delete(`/api/project/${project._id}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("پروژه قابل حذف نیست");
  });
});

const mongoose = require("mongoose");
const { startApp, stopApp, clearDb, createUser, createCategory } = require("./helpers");
const { ProjectModel } = require("../app/models/project");
const { ProposalModel } = require("../app/models/proposal");

let app, owner, otherOwner, freelancer, project;

const proposalBody = () => ({
  description: "I can do it",
  price: 500000,
  duration: 10,
  projectId: String(project._id),
});

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);
beforeEach(async () => {
  await clearDb();
  owner = await createUser(app, { phoneNumber: "09120000021", role: "OWNER" });
  otherOwner = await createUser(app, { phoneNumber: "09120000022", role: "OWNER" });
  freelancer = await createUser(app, { phoneNumber: "09120000023", role: "FREELANCER" });
  const category = await createCategory();
  project = await ProjectModel.create({
    title: "Landing page",
    description: "Build it",
    category: category._id,
    deadline: "2030-01-01",
    budget: 1000000,
    owner: owner.user._id,
  });
});

const addProposal = async () => {
  await freelancer.agent.post("/api/proposal/add").send(proposalBody()).expect(201);
  return ProposalModel.findOne({ user: freelancer.user._id });
};

describe("POST /api/proposal/add", () => {
  it("creates a pending proposal and links it to the project", async () => {
    const res = await freelancer.agent.post("/api/proposal/add").send(proposalBody());

    expect(res.status).toBe(201);
    expect(res.body.data.message).toBe("پیشنهاد با موفقیت ایجاد شد");
    const proposal = await ProposalModel.findOne({ user: freelancer.user._id });
    expect(proposal).toMatchObject({ status: 1, price: 500000, duration: 10 });
    expect((await ProjectModel.findById(project._id)).proposals.map(String)).toEqual([String(proposal._id)]);
  });

  it("forbids owners", async () => {
    const res = await owner.agent.post("/api/proposal/add").send(proposalBody());
    expect(res.status).toBe(403);
  });

  it("requires duration", async () => {
    const { duration, ...body } = proposalBody();
    const res = await freelancer.agent.post("/api/proposal/add").send(body);
    expect(res.status).toBe(400);
  });

  it("accepts a proposal for a project that does not exist", async () => {
    const res = await freelancer.agent
      .post("/api/proposal/add")
      .send({ ...proposalBody(), projectId: String(new mongoose.Types.ObjectId()) });
    expect(res.status).toBe(201);
    expect(await ProposalModel.countDocuments()).toBe(1);
  });

  it("accepts a proposal for a CLOSED project", async () => {
    await ProjectModel.updateOne({ _id: project._id }, { status: "CLOSED" });
    const res = await freelancer.agent.post("/api/proposal/add").send(proposalBody());
    expect(res.status).toBe(201);
  });
});

describe("GET /api/proposal/list", () => {
  it("returns only the freelancer's own proposals", async () => {
    const mine = await addProposal();
    await ProposalModel.create({ description: "other", price: 1, duration: 1, user: otherOwner.user._id });

    const res = await freelancer.agent.get("/api/proposal/list");

    expect(res.status).toBe(200);
    expect(res.body.data.proposals.map((p) => p._id)).toEqual([String(mine._id)]);
  });
});

describe("PATCH /api/proposal/:id (accept/reject)", () => {
  it("accepting sets the proposal to 2 and assigns the freelancer to the project", async () => {
    const proposal = await addProposal();
    const res = await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("وضعیت پروپوزال تایید شد");
    expect((await ProposalModel.findById(proposal._id)).status).toBe(2);
    const updated = await ProjectModel.findById(project._id);
    expect(String(updated.freelancer)).toBe(String(freelancer.user._id));
    expect(updated.status).toBe("OPEN"); // accepting does not close the project
  });

  it("rejecting sets the proposal to 0 and clears the project's freelancer", async () => {
    const proposal = await addProposal();
    await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 }).expect(200);

    const res = await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 0 });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("وضعیت پروپوزال به حالت رد شده تغییر یافت");
    expect((await ProposalModel.findById(proposal._id)).status).toBe(0);
    expect((await ProjectModel.findById(project._id)).freelancer).toBeNull();
  });

  it("setting back to pending also clears the freelancer", async () => {
    const proposal = await addProposal();
    await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 }).expect(200);

    const res = await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: "1" });

    expect(res.body.data.message).toBe("وضعیت پروپوزال به حالت در انتظار تایید تغییر یافت");
    expect((await ProjectModel.findById(project._id)).freelancer).toBeNull();
  });

  it("forbids freelancers", async () => {
    const proposal = await addProposal();
    const res = await freelancer.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 });
    expect(res.status).toBe(403);
  });

  it("lets an owner accept a proposal on someone else's project (no ownership check)", async () => {
    const proposal = await addProposal();
    const res = await otherOwner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 });
    expect(res.status).toBe(200);
    expect(String((await ProjectModel.findById(project._id)).freelancer)).toBe(String(freelancer.user._id));
  });

  it("returns 500 for a proposal no project links to, after already changing its status", async () => {
    const orphan = await ProposalModel.create({ description: "x", price: 1, duration: 1, user: freelancer.user._id });
    const res = await owner.agent.patch(`/api/proposal/${orphan._id}`).send({ status: 2 });
    expect(res.status).toBe(500);
    expect((await ProposalModel.findById(orphan._id)).status).toBe(2);
  });
});

import type { Express } from "express";
import mongoose from "mongoose";
import { startApp, stopApp, clearDb, createUser, createCategory, type TestUser } from "./helpers";
import { ProjectModel } from "../app/models/project";
import { ProposalModel } from "../app/models/proposal";

let app: Express, owner: TestUser, otherOwner: TestUser, freelancer: TestUser;
let project: { _id: mongoose.Types.ObjectId };

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
  return (await ProposalModel.findOne({ user: freelancer.user._id }))!;
};

describe("POST /api/proposal/add", () => {
  it("creates a pending proposal and links it to the project", async () => {
    const res = await freelancer.agent.post("/api/proposal/add").send(proposalBody());

    expect(res.status).toBe(201);
    expect(res.body.data.message).toBe("پیشنهاد با موفقیت ایجاد شد");
    const proposal = (await ProposalModel.findOne({ user: freelancer.user._id }))!;
    expect(proposal).toMatchObject({ status: 1, price: 500000, duration: 10 });
    expect(String(proposal.project)).toBe(String(project._id));
    expect((await ProjectModel.findById(project._id))!.proposals.map(String)).toEqual([String(proposal._id)]);
  });

  it("forbids owners", async () => {
    const res = await owner.agent.post("/api/proposal/add").send(proposalBody());
    expect(res.status).toBe(403);
  });

  it("forbids admins", async () => {
    const admin = await createUser(app, { phoneNumber: "09120000025", role: "ADMIN" });
    const res = await admin.agent.post("/api/proposal/add").send(proposalBody());
    expect(res.status).toBe(403);
    expect(await ProposalModel.countDocuments()).toBe(0);
  });

  it("requires price (400, not a model 500)", async () => {
    const { price, ...body } = proposalBody();
    const res = await freelancer.agent.post("/api/proposal/add").send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("قیمت وارد شده صحیح نمیباشد");
    expect(await ProposalModel.countDocuments()).toBe(0);
  });

  it("requires duration", async () => {
    const { duration, ...body } = proposalBody();
    const res = await freelancer.agent.post("/api/proposal/add").send(body);
    expect(res.status).toBe(400);
  });

  it("returns 404 for a project that does not exist", async () => {
    const res = await freelancer.agent
      .post("/api/proposal/add")
      .send({ ...proposalBody(), projectId: String(new mongoose.Types.ObjectId()) });
    expect(res.status).toBe(404);
    expect(await ProposalModel.countDocuments()).toBe(0);
  });

  it("returns 400 for a CLOSED project", async () => {
    await ProjectModel.updateOne({ _id: project._id }, { status: "CLOSED" });
    const res = await freelancer.agent.post("/api/proposal/add").send(proposalBody());
    expect(res.status).toBe(400);
    expect(await ProposalModel.countDocuments()).toBe(0);
  });

  it("returns 409 for a second proposal from the same freelancer", async () => {
    await addProposal();
    const res = await freelancer.agent.post("/api/proposal/add").send(proposalBody());
    expect(res.status).toBe(409);
    expect(await ProposalModel.countDocuments()).toBe(1);
    expect((await ProjectModel.findById(project._id))!.proposals).toHaveLength(1);
  });
});

describe("GET /api/proposal/list", () => {
  it("returns only the freelancer's own proposals", async () => {
    const mine = await addProposal();
    await ProposalModel.create({
      description: "other",
      price: 1,
      duration: 1,
      user: otherOwner.user._id,
      project: project._id,
    });

    const res = await freelancer.agent.get("/api/proposal/list");

    expect(res.status).toBe(200);
    expect(res.body.data.proposals.map((p: { _id: string }) => p._id)).toEqual([String(mine._id)]);
    const [p] = res.body.data.proposals;
    expect(p.user).toMatchObject({ _id: String(freelancer.user._id), name: freelancer.user.name });
    expect(p.project).toMatchObject({ _id: String(project._id), title: "Landing page" });
    expect(p.project.owner).toMatchObject({ _id: String(owner.user._id), name: owner.user.name });
  });
});

describe("GET /api/project/:id as a freelancer", () => {
  it("reads any project, read-only, with only the freelancer's own proposal", async () => {
    const mine = await addProposal();
    await ProposalModel.create({
      description: "other",
      price: 1,
      duration: 1,
      user: otherOwner.user._id,
      project: project._id,
    }).then((p) => ProjectModel.updateOne({ _id: project._id }, { $push: { proposals: p._id } }));

    const res = await freelancer.agent.get(`/api/project/${project._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.project.title).toBe("Landing page");
    expect(res.body.data.project.proposals.map((p: { _id: string }) => p._id)).toEqual([String(mine._id)]);
    expect((await freelancer.agent.patch(`/api/project/${project._id}`).send({ status: "CLOSED" })).status).toBe(403);
    expect((await freelancer.agent.delete(`/api/project/${project._id}`)).status).toBe(403);
  });

  it("returns 404 for a project that does not exist", async () => {
    const res = await freelancer.agent.get(`/api/project/${new mongoose.Types.ObjectId()}`);
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/proposal/:id (accept/reject)", () => {
  const otherProposal = (status: 0 | 1 = 1) =>
    ProposalModel.create({
      description: "other",
      price: 1,
      duration: 1,
      user: otherOwner.user._id,
      project: project._id,
      status,
    });

  it("accepting assigns the freelancer, closes the project and rejects the other pending proposals", async () => {
    const proposal = await addProposal();
    const pending = await otherProposal();
    const res = await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("وضعیت پروپوزال تایید شد");
    expect((await ProposalModel.findById(proposal._id))!.status).toBe(2);
    expect((await ProposalModel.findById(pending._id))!.status).toBe(0);
    const updated = (await ProjectModel.findById(project._id))!;
    expect(String(updated.freelancer)).toBe(String(freelancer.user._id));
    expect(updated.status).toBe("CLOSED");
  });

  it("refuses a second accepted proposal on the same project, changing nothing", async () => {
    const proposal = await addProposal();
    const second = await otherProposal(0);
    await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 }).expect(200);

    const res = await owner.agent.patch(`/api/proposal/${second._id}`).send({ status: 2 });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("PROPOSAL_ALREADY_ACCEPTED");
    expect((await ProposalModel.findById(second._id))!.status).toBe(0);
    expect(String((await ProjectModel.findById(project._id))!.freelancer)).toBe(String(freelancer.user._id));
  });

  it("un-accepting clears the freelancer and leaves the project status to the owner", async () => {
    const proposal = await addProposal();
    await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 }).expect(200);

    await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 1 }).expect(200);

    const updated = (await ProjectModel.findById(project._id))!;
    expect(updated.freelancer).toBeNull();
    expect(updated.status).toBe("CLOSED");
  });

  it("rejecting a proposal that was not accepted keeps the assigned freelancer", async () => {
    const proposal = await addProposal();
    const other = await otherProposal();
    await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 }).expect(200);

    await owner.agent.patch(`/api/proposal/${other._id}`).send({ status: 0 }).expect(200);

    expect(String((await ProjectModel.findById(project._id))!.freelancer)).toBe(String(freelancer.user._id));
  });

  it("rejecting sets the proposal to 0 and clears the project's freelancer", async () => {
    const proposal = await addProposal();
    await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 }).expect(200);

    const res = await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 0 });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("وضعیت پروپوزال به حالت رد شده تغییر یافت");
    expect((await ProposalModel.findById(proposal._id))!.status).toBe(0);
    expect((await ProjectModel.findById(project._id))!.freelancer).toBeNull();
  });

  it("setting back to pending also clears the freelancer", async () => {
    const proposal = await addProposal();
    await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 }).expect(200);

    const res = await owner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: "1" });

    expect(res.body.data.message).toBe("وضعیت پروپوزال به حالت در انتظار تایید تغییر یافت");
    expect((await ProjectModel.findById(project._id))!.freelancer).toBeNull();
  });

  it("forbids freelancers", async () => {
    const proposal = await addProposal();
    const res = await freelancer.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 });
    expect(res.status).toBe(403);
  });

  it("forbids an owner from accepting a proposal on someone else's project", async () => {
    const proposal = await addProposal();
    const res = await otherOwner.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 });
    expect(res.status).toBe(403);
    expect((await ProposalModel.findById(proposal._id))!.status).toBe(1);
    expect((await ProjectModel.findById(project._id))!.freelancer).toBeNull();
  });

  it("lets an admin accept a proposal on any project", async () => {
    const admin = await createUser(app, { phoneNumber: "09120000024", role: "ADMIN" });
    const proposal = await addProposal();
    const res = await admin.agent.patch(`/api/proposal/${proposal._id}`).send({ status: 2 });
    expect(res.status).toBe(200);
    expect(String((await ProjectModel.findById(project._id))!.freelancer)).toBe(String(freelancer.user._id));
  });

  it("returns 404 for a proposal whose project is gone, without changing its status", async () => {
    const orphan = await ProposalModel.create({
      description: "x",
      price: 1,
      duration: 1,
      user: freelancer.user._id,
      project: new mongoose.Types.ObjectId(),
    });
    const res = await owner.agent.patch(`/api/proposal/${orphan._id}`).send({ status: 2 });
    expect(res.status).toBe(404);
    expect((await ProposalModel.findById(orphan._id))!.status).toBe(1);
  });
});

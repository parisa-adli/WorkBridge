import type { Express } from "express";
import { startApp, stopApp, clearDb, createUser, createCategory, type TestUser } from "./helpers";
import { UserModel } from "../app/models/user";
import { ProjectModel } from "../app/models/project";
import { ProposalModel } from "../app/models/proposal";

let app: Express, admin: TestUser, member: TestUser;

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);
beforeEach(async () => {
  await clearDb();
  admin = await createUser(app, { phoneNumber: "09120000031", role: "ADMIN" });
  member = await createUser(app, { phoneNumber: "09120000032", role: "FREELANCER", status: 1 });
});

const setStatus = (status: unknown, agent = admin.agent) =>
  agent.patch(`/api/admin/user/verify/${member.user._id}`).send({ status });

describe("admin user management", () => {
  it("lists users", async () => {
    const res = await admin.agent.get("/api/admin/user/list");
    expect(res.status).toBe(200);
    expect(res.body.data.users.map((u: { phoneNumber: string }) => u.phoneNumber).sort()).toEqual(["09120000031", "09120000032"]);
  });

  it("verifying a pending user lets them use verified routes", async () => {
    expect((await member.agent.get("/api/proposal/list")).status).toBe(403);

    const res = await setStatus(2);

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("وضعیت کاربر تایید شد");
    expect((await UserModel.findById(member.user._id))!.status).toBe(2);
    expect((await member.agent.get("/api/proposal/list")).status).toBe(200);
  });

  it("blocking a user locks them out", async () => {
    await setStatus(2).expect(200);

    const res = await setStatus("0");

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("وضعیت کاربر به حالت رد شده تغییر یافت");
    const blocked = await member.agent.get("/api/proposal/list");
    expect(blocked.status).toBe(403);
    expect(blocked.body.message).toBe("پروفایل شما مورد تایید قرار نگرفته است.");
  });

  it("succeeds when the status is already set (timestamps bump updatedAt)", async () => {
    const res = await setStatus(1);
    expect(res.status).toBe(200);
  });

  it.each([5, "x", undefined])("rejects status %s with 400", async (status) => {
    const res = await setStatus(status);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("وضعیت کاربر صحیح نمی باشد");
    expect((await UserModel.findById(member.user._id).lean())!.status).toBe(1);
  });

  it("searches users by name, email or phone", async () => {
    const res = await admin.agent.get("/api/admin/user/list?search=0032");
    expect(res.status).toBe(200);
    expect(res.body.data.users.map((u: { phoneNumber: string }) => u.phoneNumber)).toEqual(["09120000032"]);
  });

  it.each(["(", ".*"])("treats search %s literally instead of as a regex", async (search) => {
    const res = await admin.agent.get(`/api/admin/user/list?search=${encodeURIComponent(search)}`);
    expect(res.status).toBe(200);
    expect(res.body.data.users).toEqual([]);
  });

  it("returns a user's profile with project titles on proposals and no otp", async () => {
    const category = await createCategory();
    const project = await ProjectModel.create({
      title: "Landing page",
      description: "Build it",
      category: category._id,
      deadline: "2030-01-01",
      budget: 1000000,
      owner: admin.user._id,
      freelancer: member.user._id,
    });
    await ProposalModel.create({ description: "d", price: 1, duration: 1, user: member.user._id, project: project._id });

    const res = await admin.agent.get(`/api/admin/user/profile/${member.user._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.phoneNumber).toBe("09120000032");
    expect(res.body.data.user).not.toHaveProperty("otp");
    expect(res.body.data.createdProjects).toEqual([]);
    expect(res.body.data.completedProjects.map((p: { title: string }) => p.title)).toEqual(["Landing page"]);
    expect(res.body.data.proposals[0].project).toMatchObject({ _id: String(project._id), title: "Landing page" });
  });

  it("returns 404 for an unknown user's profile", async () => {
    const res = await admin.agent.get("/api/admin/user/profile/507f1f77bcf86cd799439011");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("USER_NOT_FOUND");
  });

  it("forbids non-admins", async () => {
    const owner = await createUser(app, { phoneNumber: "09120000033", role: "OWNER" });
    const res = await setStatus(2, owner.agent);
    expect(res.status).toBe(403);
  });
});

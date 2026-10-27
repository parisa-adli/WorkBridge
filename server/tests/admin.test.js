const { startApp, stopApp, clearDb, createUser } = require("./helpers");
const { UserModel } = require("../app/models/user");

let app, admin, member;

beforeAll(async () => {
  app = await startApp();
});
afterAll(stopApp);
beforeEach(async () => {
  await clearDb();
  admin = await createUser(app, { phoneNumber: "09120000031", role: "ADMIN" });
  member = await createUser(app, { phoneNumber: "09120000032", role: "FREELANCER", status: 1 });
});

const setStatus = (status, agent = admin.agent) =>
  agent.patch(`/api/admin/user/verify/${member.user._id}`).send({ status });

describe("admin user management", () => {
  it("lists users", async () => {
    const res = await admin.agent.get("/api/admin/user/list");
    expect(res.status).toBe(200);
    expect(res.body.data.users.map((u) => u.phoneNumber).sort()).toEqual(["09120000031", "09120000032"]);
  });

  it("verifying a pending user lets them use verified routes", async () => {
    expect((await member.agent.get("/api/proposal/list")).status).toBe(403);

    const res = await setStatus(2);

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("وضعیت کاربر تایید شد");
    expect((await UserModel.findById(member.user._id)).status).toBe(2);
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

  it("saves a status outside 0/1/2 (updateOne skips enum validation)", async () => {
    const res = await setStatus(5);
    expect(res.status).toBe(200);
    expect((await UserModel.findById(member.user._id).lean()).status).toBe(5);
  });

  it("forbids non-admins", async () => {
    const owner = await createUser(app, { phoneNumber: "09120000033", role: "OWNER" });
    const res = await setStatus(2, owner.agent);
    expect(res.status).toBe(403);
  });
});

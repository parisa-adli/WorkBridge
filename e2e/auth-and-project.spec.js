const { test, expect } = require("@playwright/test");
const { MongoClient } = require("mongodb");

const PHONE = "09120000001";
const url = (p) => `${process.env.E2E_CLIENT_URL}${p}`;

let mongo;
const users = () => mongo.db().collection("users");

test.beforeAll(async () => {
  mongo = await MongoClient.connect(process.env.E2E_MONGO_URI);
});
test.afterAll(async () => {
  await mongo.close();
});

// The server prints the OTP instead of sending SMS, so read it from the database.
async function loginWithOtp(page) {
  await page.goto(url("/auth"));
  await page.getByRole("tab", { name: "ورود با موبایل" }).click();
  await page.getByLabel("شماره موبایل").fill(PHONE);
  await page.getByRole("button", { name: "ارسال کد تایید" }).click();
  await expect(page.getByText("کد تایید را وارد کنید")).toBeVisible();

  const { otp } = await users().findOne({ phoneNumber: PHONE });
  await page.locator("form input").first().click();
  await page.keyboard.type(String(otp.code));
  await page.getByRole("button", { name: "تایید", exact: true }).click();
}

const DEMO_ROLES = [
  ["کارفرما", "demo-owner", "/owner"],
  ["فریلنسر", "demo-freelancer", "/freelancer"],
  ["مدیر", "demo-admin", "/admin"],
];

async function demoLogin(page, role, username, home) {
  await page.goto(url("/auth"));
  await expect(page.getByRole("tab", { name: "ورود نمایشی" })).toHaveAttribute("aria-selected", "true");
  await page.getByLabel(role).check();
  await expect(page.getByLabel("نام کاربری")).toHaveValue(username);
  await expect(page.getByText(username, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "ورود", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${home}/dashboard$`));
}

test.describe("demo login", () => {
  for (const [role, username, home] of DEMO_ROLES) {
    test(`${username} lands on its dashboard`, async ({ page }) => {
      await demoLogin(page, role, username, home);
    });
  }
});

test.describe("logout", () => {
  for (const [role, username, home] of DEMO_ROLES) {
    test(`${username} logs out, then ${home} redirects to auth`, async ({ page }) => {
      await demoLogin(page, role, username, home);
      await page.getByRole("button", { name: "خروج" }).click();
      await expect(page).toHaveURL(url("/"));

      await page.goto(url(home));
      await expect(page).toHaveURL(url("/auth"));
    });
  }
});

test("owner accepts a proposal, the freelancer sees it accepted", async ({ page }) => {
  const db = mongo.db();
  const [owner, freelancer, category] = await Promise.all([
    users().findOne({ username: "demo-owner" }),
    users().findOne({ username: "demo-freelancer" }),
    db.collection("categories").findOne(),
  ]);
  const title = "پروژه پذیرش پیشنهاد";
  const { insertedId: projectId } = await db.collection("projects").insertOne({
    title,
    description: "پروژه ای برای تست پذیرش پیشنهاد",
    status: "OPEN",
    category: category._id,
    budget: 500000,
    tags: [],
    proposals: [],
    deadline: new Date("2030-01-01"),
    owner: owner._id,
    freelancer: null,
  });
  const { insertedId: proposalId } = await db.collection("proposals").insertOne({
    description: "من این پروژه را انجام می دهم",
    price: 400000,
    duration: 10,
    user: freelancer._id,
    project: projectId,
    status: 1,
  });
  await db.collection("projects").updateOne({ _id: projectId }, { $push: { proposals: proposalId } });

  await demoLogin(page, "کارفرما", "demo-owner", "/owner");
  await page.goto(url(`/owner/projects/${projectId}`));
  await page.getByRole("button", { name: "تغییر وضعیت درخواست" }).click();
  await page.getByRole("combobox", { name: "تغییر وضعیت" }).selectOption({ label: "تایید شده" });
  await page.getByRole("button", { name: "تایید", exact: true }).click();
  await expect(page.getByRole("cell", { name: "تایید شده" })).toBeVisible();
  await page.getByRole("button", { name: "خروج" }).click();

  await demoLogin(page, "فریلنسر", "demo-freelancer", "/freelancer");
  await page.goto(url("/freelancer/proposals"));
  await page.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(url(`/freelancer/projects/${projectId}`));
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText("بسته", { exact: true })).toBeVisible();
  await expect(page.getByText("تایید شده", { exact: true })).toBeVisible();
});

test.describe.serial("OTP login", () => {
  test("new user completes profile as OWNER and waits for approval", async ({ page }) => {
    await loginWithOtp(page);
    await expect(page).toHaveURL(url("/complete-profile"));

    await page.getByLabel("نام و نام خانوادگی").fill("کارفرما تست");
    await page.getByLabel("ایمیل").fill("owner@example.com");
    await page.getByLabel("کارفرما").check();
    await page.getByRole("button", { name: "تایید", exact: true }).click();

    await expect(page).toHaveURL(url("/"));
    await expect(page.getByText("پروفایل شما در انتظار تایید است")).toBeVisible();
  });

  test("verified OWNER logs in and creates a project", async ({ page }) => {
    await users().updateOne({ phoneNumber: PHONE }, { $set: { status: 2 } });

    await loginWithOtp(page);
    await expect(page).toHaveURL(/\/owner(\/|$)/);

    await page.goto(url("/owner/projects"));
    await page.getByRole("button", { name: "اضافه کردن پروژه" }).click();

    const title = "پروژه تست انتها به انتها";
    await page.getByLabel("عنوان پروژه").fill(title);
    await page.getByLabel("توضیحات").fill("توضیحات پروژه برای تست انتها به انتها");
    await page.getByLabel("بودجه").fill("200000");
    await page.getByLabel("دسته بندی").selectOption({ label: "برنامه نویسی" });

    // The deadline has no default (submitting without one is refused), so pick a day.
    const deadline = page.locator(".rmdp-container input");
    await deadline.click();
    await page.locator(".rmdp-day-picker .rmdp-day:not(.rmdp-deactive):not(.rmdp-disabled):not(.rmdp-day-hidden) span").last().click();
    await expect(deadline).not.toHaveValue("");
    await page.getByText("اضافه کردن پروژه جدید").click(); // close the calendar

    await page.getByRole("button", { name: "تایید", exact: true }).click();
    await expect(page.getByRole("cell", { name: title })).toBeVisible();
  });
});

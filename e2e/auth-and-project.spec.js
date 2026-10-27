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
  await page.getByLabel("شماره موبایل").fill(PHONE);
  await page.getByRole("button", { name: "ارسال کد تایید" }).click();
  await expect(page.getByText("کد تایید را وارد کنید")).toBeVisible();

  const { otp } = await users().findOne({ phoneNumber: PHONE });
  await page.locator("form input").first().click();
  await page.keyboard.type(String(otp.code));
  await page.getByRole("button", { name: "تایید", exact: true }).click();
}

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

    // The deadline has no default (an empty date throws on submit), so pick a day.
    const deadline = page.locator(".rmdp-container input");
    await deadline.click();
    await page.locator(".rmdp-day-picker .rmdp-day:not(.rmdp-deactive):not(.rmdp-disabled):not(.rmdp-day-hidden) span").last().click();
    await expect(deadline).not.toHaveValue("");
    await page.getByText("اضافه کردن پروژه جدید").click(); // close the calendar

    await page.getByRole("button", { name: "تایید", exact: true }).click();
    await expect(page.getByRole("cell", { name: title })).toBeVisible();
  });
});

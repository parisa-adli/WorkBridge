const { test, expect } = require("@playwright/test");
const { MongoClient } = require("mongodb");

// Baseline of the Tailwind 3 styles for Phase 28b to compare against.
// Update with `npm run e2e -- screenshots --update-snapshots` only when a visual change is intended.
const OWNER = { username: "demo-owner", password: "Owner@1234" };
const url = (p) => `${process.env.E2E_CLIENT_URL}${p}`;

const PAGES = [
  { name: "home", path: "/" },
  { name: "auth", path: "/auth" },
  { name: "owner-dashboard", path: "/owner/dashboard", owner: true },
  { name: "owner-projects", path: "/owner/projects", owner: true },
];

// Fixed data so nothing in the shots depends on today's date or on other specs.
test.beforeAll(async () => {
  const mongo = await MongoClient.connect(process.env.E2E_MONGO_URI);
  try {
    const db = mongo.db();
    const owner = await db.collection("users").findOne({ username: OWNER.username });
    const category = await db.collection("categories").findOne({ englishTitle: "programming" });
    const at = new Date("2026-01-01T00:00:00Z");
    await db.collection("projects").deleteMany({ owner: owner._id });
    await db.collection("projects").insertMany(
      [
        { title: "طراحی فروشگاه آنلاین", budget: 25000000, deadline: "2026-03-20", status: "OPEN", tags: ["React", "Node"] },
        { title: "اپلیکیشن موبایل رزرو", budget: 40000000, deadline: "2026-05-01", status: "CLOSED", tags: ["Flutter"] },
      ].map((p) => ({
        ...p,
        description: "پروژه نمونه برای اسکرین‌شات",
        deadline: new Date(p.deadline),
        category: category._id,
        owner: owner._id,
        freelancer: null,
        proposals: [],
        createdAt: at,
        updatedAt: at,
      }))
    );
  } finally {
    await mongo.close();
  }
});

for (const language of ["fa", "en"]) {
  for (const theme of ["light", "dark"]) {
    for (const { name, path, owner } of PAGES) {
      test(`${name} ${language} ${theme}`, async ({ page }) => {
        // The home footer prints the current year.
        await page.clock.setFixedTime(new Date("2026-06-01T12:00:00Z"));
        await page.addInitScript(
          ({ language, dark }) => {
            localStorage.setItem("language", JSON.stringify(language));
            localStorage.setItem("isDarkMode", JSON.stringify(dark));
          },
          { language, dark: theme === "dark" }
        );
        // page.request shares the page's cookie jar, so the session cookies reach the client.
        if (owner) expect((await page.request.post(`${process.env.E2E_SERVER_URL}/api/user/demo-login`, { data: OWNER })).ok()).toBe(true);

        await page.goto(url(path));
        await expect(page.locator("html")).toHaveAttribute("lang", language);
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(`${name}-${language}-${theme}.png`, { fullPage: true, animations: "disabled" });
      });
    }
  }
}

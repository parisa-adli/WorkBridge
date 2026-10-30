const { test, expect } = require("@playwright/test");
const { MongoClient } = require("mongodb");

// Visual baselines of the re-skinned pages; the four list pages also at 360px.
// Update with `npm run e2e -- screenshots --update-snapshots` only when a visual change is intended.
const ACCOUNTS = {
  owner: { username: "demo-owner", password: "Owner@1234" },
  freelancer: { username: "demo-freelancer", password: "Freelancer@1234" },
  admin: { username: "demo-admin", password: "Admin@1234" },
};
const OWNER = ACCOUNTS.owner;
const url = (p) => `${process.env.E2E_CLIENT_URL}${p}`;
const HOME_STATS = {
  freelancers: 12,
  owners: 7,
  openProjects: 31,
  categories: [
    { _id: "c1", title: "برنامه نویسی", englishTitle: "development", projects: 18 },
    { _id: "c2", title: "طراحی", englishTitle: "design", projects: 9 },
    { _id: "c3", title: "ترجمه", englishTitle: "translation", projects: 4 },
  ],
};

// The shared lists (all projects, proposals, users) change with what other specs create, so pin them too.
const page1 = (items) => ({ statusCode: 200, data: { items, total: items.length, page: 1, limit: 10 } });
const person = (name, english) => ({ _id: name, name, translations: { en: { name: english } } });
const category = { _id: "c1", title: "برنامه نویسی", englishTitle: "programming" };
const LIST_PROJECTS = [
  { title: "طراحی فروشگاه آنلاین", english: "Online store design", budget: 25000000, deadline: "2026-03-20", status: "OPEN" },
  { title: "اپلیکیشن موبایل رزرو", english: "Booking mobile app", budget: 40000000, deadline: "2026-05-01", status: "CLOSED" },
].map(({ english, ...p }, i) => ({
  ...p,
  _id: `p${i}`,
  translations: { en: { title: english } },
  category,
  owner: person("سارا احمدی", "Sara Ahmadi"),
}));
const LISTS = {
  "/api/project/list": page1(LIST_PROJECTS),
  "/api/proposal/list": page1(
    LIST_PROJECTS.map((project, i) => ({
      _id: `r${i}`,
      project,
      user: person("علی رضایی", "Ali Rezaei"),
      description: "این پروژه را با کیفیت بالا و در زمان تعیین شده انجام می‌دهم.",
      translations: { en: { description: "I will deliver this project on time and with high quality." } },
      duration: 10 + i * 5,
      price: 20000000 + i * 10000000,
      status: i,
    }))
  ),
  "/api/admin/user/list": page1(
    [
      { ...person("سارا احمدی", "Sara Ahmadi"), email: "sara@example.com", phoneNumber: "09120000010", role: "OWNER", status: 2 },
      { ...person("علی رضایی", "Ali Rezaei"), email: "ali@example.com", phoneNumber: "09120000011", role: "FREELANCER", status: 1 },
    ]
  ),
};

const PAGES = [
  { name: "home", path: "/" },
  { name: "auth", path: "/auth" },
  { name: "owner-dashboard", path: "/owner/dashboard", account: "owner" },
  { name: "owner-projects", path: "/owner/projects", account: "owner", list: true },
  { name: "freelancer-projects", path: "/freelancer/projects", account: "freelancer", list: true },
  { name: "freelancer-proposals", path: "/freelancer/proposals", account: "freelancer", list: true },
  { name: "admin-users", path: "/admin/users", account: "admin", list: true },
];
// Each list page is also shot at 360px, the narrowest supported width.
const SHOTS = PAGES.flatMap((p) => (p.list ? [p, { ...p, name: `${p.name}-360`, mobile: true }] : [p]));

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
    for (const { name, path, account, mobile } of SHOTS) {
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
        if (account) expect((await page.request.post(`${process.env.E2E_SERVER_URL}/api/user/demo-login`, { data: ACCOUNTS[account] })).ok()).toBe(true);
        // The home counts depend on what other specs created, so pin them.
        await page.route("**/api/stats/public", (route) => route.fulfill({ json: { statusCode: 200, data: HOME_STATS } }));
        for (const [list, json] of Object.entries(LISTS)) await page.route((u) => u.pathname === list, (route) => route.fulfill({ json }));
        if (mobile) await page.setViewportSize({ width: 360, height: 740 });

        await page.goto(url(path));
        await expect(page.locator("html")).toHaveAttribute("lang", language);
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);
        // A wide table scrolls inside its own container; neither the page nor the content area scrolls sideways.
        const overflow = await page.evaluate(() =>
          [document.documentElement, document.querySelector('[data-slot="sidebar-inset"] .overflow-y-auto')]
            .filter(Boolean)
            .map((el) => el.scrollWidth - el.clientWidth)
        );
        expect(overflow.every((px) => px <= 0)).toBe(true);
        await expect(page).toHaveScreenshot(`${name}-${language}-${theme}.png`, { fullPage: true, animations: "disabled" });
      });
    }
  }
}

const { test, expect } = require("@playwright/test");
const { MongoClient } = require("mongodb");
const { default: AxeBuilder } = require("@axe-core/playwright");

// Every F9 page (docs/design.md §7): a visual baseline and no WCAG 2.2 AA violations; the lists, project detail pages and the app layout (drawer closed and open) also at 360px.
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

// The shared lists (all projects, proposals, users, categories) and the detail pages change with what other specs create, so pin them too.
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
const PROPOSALS = LIST_PROJECTS.map((project, i) => ({
  _id: `r${i}`,
  project,
  user: person("علی رضایی", "Ali Rezaei"),
  description: "این پروژه را با کیفیت بالا و در زمان تعیین شده انجام می‌دهم.",
  translations: { en: { description: "I will deliver this project on time and with high quality." } },
  duration: 10 + i * 5,
  price: 20000000 + i * 10000000,
  status: i,
}));
const USERS = [
  { ...person("سارا احمدی", "Sara Ahmadi"), email: "sara@example.com", phoneNumber: "09120000010", role: "OWNER", status: 2 },
  { ...person("علی رضایی", "Ali Rezaei"), email: "ali@example.com", phoneNumber: "09120000011", role: "FREELANCER", status: 1 },
];
const PINNED = {
  "/api/project/list": page1(LIST_PROJECTS),
  "/api/proposal/list": page1(PROPOSALS),
  "/api/admin/user/list": page1(USERS),
  "/api/category/list": {
    statusCode: 200,
    data: {
      categories: [
        { ...category, type: "project", parentId: null },
        { _id: "c2", title: "طراحی وب", englishTitle: "web design", type: "project", parentId: "c1" },
      ],
    },
  },
  // the owner sees every proposal, the freelancer only the first (theirs)
  "/api/project/p0": {
    statusCode: 200,
    data: {
      project: {
        ...LIST_PROJECTS[0],
        description: "یک فروشگاه آنلاین با سبد خرید و پرداخت.",
        translations: { en: { title: "Online store design", description: "An online store with a cart and checkout." } },
        tags: ["React", "Node"],
        proposals: PROPOSALS.map(({ project, ...proposal }) => proposal),
      },
    },
  },
  "/api/admin/user/profile/u0": {
    statusCode: 200,
    data: {
      user: { ...USERS[1], _id: "u0", biography: "توسعه دهنده وب", translations: { en: { name: "Ali Rezaei", biography: "Web developer" } } },
      createdProjects: [],
      completedProjects: [LIST_PROJECTS[1]],
      proposals: PROPOSALS,
    },
  },
};

const PAGES = [
  { name: "404", path: "/no-such-page" },
  { name: "not-access", path: "/not-access" },
  { name: "home", path: "/" },
  { name: "auth", path: "/auth" },
  // `open` brings up a state the URL alone doesn't: the phone tab, the mobile drawer.
  { name: "auth-phone", path: "/auth", open: (page) => page.getByRole("tab").nth(1).click() },
  { name: "complete-profile", path: "/complete-profile" },
  { name: "owner-dashboard", path: "/owner/dashboard", account: "owner", narrow: true },
  {
    name: "owner-dashboard-drawer-360",
    path: "/owner/dashboard",
    account: "owner",
    mobile: true,
    open: async (page) => {
      await page.locator('[data-sidebar="trigger"]').click();
      await expect(page.getByRole("dialog")).toBeVisible();
    },
  },
  { name: "freelancer-dashboard", path: "/freelancer/dashboard", account: "freelancer" },
  { name: "admin-dashboard", path: "/admin/dashboard", account: "admin" },
  { name: "owner-projects", path: "/owner/projects", account: "owner", narrow: true },
  { name: "owner-project", path: "/owner/projects/p0", account: "owner", narrow: true },
  { name: "owner-profile", path: "/owner/profile", account: "owner" },
  { name: "freelancer-projects", path: "/freelancer/projects", account: "freelancer", narrow: true },
  { name: "freelancer-project", path: "/freelancer/projects/p0", account: "freelancer", narrow: true },
  { name: "freelancer-proposals", path: "/freelancer/proposals", account: "freelancer", narrow: true },
  { name: "admin-projects", path: "/admin/projects", account: "admin" },
  { name: "admin-proposals", path: "/admin/proposals", account: "admin" },
  { name: "admin-users", path: "/admin/users", account: "admin", narrow: true },
  { name: "admin-user", path: "/admin/users/u0", account: "admin" },
  { name: "admin-categories", path: "/admin/categories", account: "admin" },
];
const SHOTS = PAGES.flatMap((p) => (p.narrow ? [p, { ...p, name: `${p.name}-360`, mobile: true }] : [p]));

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
    for (const { name, path, account, mobile, open } of SHOTS) {
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
        for (const [api, json] of Object.entries(PINNED)) await page.route((u) => u.pathname === api, (route) => route.fulfill({ json }));
        if (mobile) await page.setViewportSize({ width: 360, height: 740 });

        await page.goto(url(path));
        await expect(page.locator("html")).toHaveAttribute("lang", language);
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);
        if (open) await open(page);
        // A wide table scrolls inside its own container; neither the page nor the content area scrolls sideways.
        const overflow = await page.evaluate(() =>
          [document.documentElement, document.querySelector('[data-slot="sidebar-inset"] .overflow-y-auto')]
            .filter(Boolean)
            .map((el) => el.scrollWidth - el.clientWidth)
        );
        expect(overflow.every((px) => px <= 0)).toBe(true);
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
        await expect(page).toHaveScreenshot(`${name}-${language}-${theme}.png`, { fullPage: true, animations: "disabled" });
      });
    }
  }
}

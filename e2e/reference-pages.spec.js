const { test, expect } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");

// Phase 29 reference pages: no WCAG 2.2 AA violations in either language or theme (docs/design.md §6).
// Signed in, not-access also shows the link to the user's dashboard.
const OWNER = { username: "demo-owner", password: "Owner@1234" };
const PAGES = [
  { name: "404", path: "/no-such-page" },
  { name: "not-access", path: "/not-access" },
  { name: "not-access signed in", path: "/not-access", owner: true },
];

for (const language of ["fa", "en"]) {
  for (const theme of ["light", "dark"]) {
    for (const { name, path, owner } of PAGES) {
      test(`${name} ${language} ${theme} passes axe`, async ({ page }) => {
        await page.addInitScript(
          ({ language, dark }) => {
            localStorage.setItem("language", JSON.stringify(language));
            localStorage.setItem("isDarkMode", JSON.stringify(dark));
          },
          { language, dark: theme === "dark" }
        );
        // page.request shares the page's cookie jar, so the session cookies reach the client.
        if (owner) expect((await page.request.post(`${process.env.E2E_SERVER_URL}/api/user/demo-login`, { data: OWNER })).ok()).toBe(true);
        await page.goto(`${process.env.E2E_CLIENT_URL}${path}`);
        await expect(page.locator("html")).toHaveAttribute("lang", language);
        await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark-mode/ : /^(?!.*dark-mode)/);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        if (owner) await expect(page.getByRole("link", { name: language === "fa" ? "رفتن به داشبورد" : "Go to dashboard" })).toHaveAttribute("href", "/owner/dashboard");

        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
      });
    }
  }
}

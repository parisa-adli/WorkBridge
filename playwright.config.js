const { defineConfig, devices } = require("@playwright/test");

// The app URL is only known after global setup picks free ports, so tests read it from E2E_CLIENT_URL.
module.exports = defineConfig({
  testDir: "./e2e",
  globalSetup: require.resolve("./e2e/global-setup.js"),
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: { ...devices["Desktop Chrome"], trace: "retain-on-failure", actionTimeout: 15_000 },
});

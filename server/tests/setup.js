// Tests load the app with Node's own require, which can't resolve .ts files without tsx's hook.
require("tsx/cjs");

// Runs before each test file. Set env before the app loads so dotenv never pulls values from server/.env.
Object.assign(process.env, {
  NODE_ENV: "development", // cookies without `secure`, so supertest sends them over http
  DOMAIN: "",
  ACCESS_TOKEN_SECRET_KEY: "test-access-secret",
  REFRESH_TOKEN_SECRET_KEY: "test-refresh-secret",
  COOKIE_PARSER_SECRET_KEY: "test-cookie-secret",
  TOKEN_SECRET_KEY: "test-token-secret",
  ALLOW_CORS_ORIGIN: "http://localhost:3000",
  SERVER_URL: "http://localhost:5000",
  OTP_RATE_LIMIT: "10000", // rateLimit.test.js lowers it before the app loads
});

vi.spyOn(console, "log").mockImplementation(() => {});

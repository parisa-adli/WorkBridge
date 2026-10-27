// Runs before each test file. Set env before the app loads so dotenv never pulls values from server/.env.
Object.assign(process.env, {
  NODE_ENV: "development", // cookies without `secure`, so supertest sends them over http
  DOMAIN: "",
  ACCESS_TOKEN_SECRET_KEY: "test-access-secret",
  REFRESH_TOKEN_SECRET_KEY: "test-refresh-secret",
  COOKIE_PARSER_SECRET_KEY: "test-cookie-secret",
  TOKEN_SECRET_KEY: "test-token-secret",
  KAVENEGAR_API_KEY: "test-kavenegar-key",
  ALLOW_CORS_ORIGIN: "http://localhost:3000",
  SERVER_URL: "http://localhost:5000",
});

// The app currently prints the OTP instead of sending SMS; this stub makes sure no real SMS goes out if that changes.
jest.mock("kavenegar", () => ({
  KavenegarApi: jest.fn(() => ({ Send: jest.fn(), VerifyLookup: jest.fn() })),
}));

jest.spyOn(console, "log").mockImplementation(() => {});

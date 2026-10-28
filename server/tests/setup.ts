import express from "express";
import { ERROR_CODES, SUCCESS_CODES } from "../utils/errorCodes";

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
  OTP_RATE_LIMIT: "10000", // rateLimit.test.ts lowers it before the app loads
});

vi.spyOn(console, "log").mockImplementation(() => {});

// Every response any test triggers is checked here: errors carry a code thrown on purpose (not the
// handler's fallback), and success messages carry a success code. Tests that expect a fallback call allowFallbackCode().
const FALLBACK_CODES: unknown[] = [ERROR_CODES.BAD_REQUEST, ERROR_CODES.INTERNAL_ERROR];
const problems: unknown[] = [];
let fallbackAllowed = false;

export function allowFallbackCode() {
  fallbackAllowed = true;
}

const json = express.response.json;
express.response.json = function (body) {
  const { statusCode, code, message, data } = body ?? {};
  if (statusCode >= 400) {
    if (!Object.hasOwn(ERROR_CODES, String(code)))
      problems.push({ error: "unknown error code", statusCode, code, message });
    else if (FALLBACK_CODES.includes(code) && !fallbackAllowed)
      problems.push({ error: "thrown without a code", statusCode, code, message });
  } else if (data?.message !== undefined && !Object.hasOwn(SUCCESS_CODES, String(data.code))) {
    problems.push({ error: "success message without a code", message: data.message });
  }
  return json.call(this, body);
};

afterEach(() => {
  fallbackAllowed = false;
  expect(problems.splice(0)).toEqual([]);
});

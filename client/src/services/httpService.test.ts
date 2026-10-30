import axios, {
  AxiosError,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../i18n";

type Config = InternalAxiosRequestConfig;

// One fake adapter sees every request: the app instance and the bare
// axios.get used for refresh. It must be set before httpService calls axios.create.
const adapter = vi.fn<AxiosAdapter>();
axios.defaults.adapter = adapter;

let http: typeof import("./httpService").default;
beforeAll(async () => {
  // Empty so a developer's client/.env cannot change the default under test.
  vi.stubEnv("VITE_BASE_URL", "");
  http =(await import("./httpService")).default;
});

const response = async (config: Config, data: unknown) => ({ data, status: 200, statusText: "OK", headers: {}, config });
const ok = (config: Config) => response(config, { statusCode: 200, data: "ok" });
// the server's refresh-token body: the standard envelope with the user
const refreshed = (config: Config) =>
  response(config, { statusCode: 200, data: { user: { _id: "u1" } } });
const unauthorized = (config: Config) =>
  Promise.reject(
    new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, {
      data: { statusCode: 401, code: "INVALID_TOKEN", message: "توکن نامعتبر است" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config,
    })
  );
const calledUrls = () => adapter.mock.calls.map(([config]) => config.url);

describe("httpService 401 handling", () => {
  // Braces matter: a function returned from beforeEach runs as a cleanup hook.
  beforeEach(() => {
    adapter.mockReset();
  });

  it("refreshes once and replays the original request once", async () => {
    adapter
      .mockImplementationOnce(unauthorized)
      .mockImplementationOnce(refreshed)
      .mockImplementationOnce(ok);

    const res = await http.get("/project/list");

    expect(res.data.data).toBe("ok");
    expect(calledUrls()).toEqual([
      "/project/list",
      "http://localhost:5000/api/user/refresh-token",
      "/project/list",
    ]);
  });

  it("rejects with the original 401 (code and Persian message) when refresh returns no user", async () => {
    adapter
      .mockImplementationOnce(unauthorized)
      .mockImplementationOnce((config) => response(config, { statusCode: 200, data: { user: null } }));

    await expect(http.get("/project/list")).rejects.toMatchObject({
      response: { status: 401, data: { code: "INVALID_TOKEN", message: "توکن نامعتبر است" } },
    });
    expect(calledUrls()).toEqual([
      "/project/list",
      "http://localhost:5000/api/user/refresh-token",
    ]);
  });

  it.each([
    ["fa", "نام کاربری یا رمز عبور اشتباه است"],
    ["en", "Wrong username or password"],
  ])("rejects a login 401 with its own error and no refresh (%s)", async (lng, message) => {
    await i18n.changeLanguage(lng);
    adapter.mockImplementationOnce((config) =>
      Promise.reject(
        new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, {
          data: { statusCode: 401, code: "INVALID_CREDENTIALS", message: "نام کاربری یا رمز عبور اشتباه است" },
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config,
        })
      )
    );

    await expect(http.post("/user/demo-login")).rejects.toMatchObject({
      response: { status: 401, data: { code: "INVALID_CREDENTIALS", message } },
    });
    expect(calledUrls()).toEqual(["/user/demo-login"]);
  });

  it("rejects a network error (no response) without trying to refresh", async () => {
    adapter.mockImplementation((config) =>
      Promise.reject(new AxiosError("Network Error", "ERR_NETWORK", config))
    );

    await expect(http.get("/project/list")).rejects.toMatchObject({
      code: "ERR_NETWORK",
    });
    expect(calledUrls()).toEqual(["/project/list"]);
  });

  it("does not loop when the replay gets a second 401", async () => {
    adapter.mockImplementation((config) =>
      config.url?.endsWith("/user/refresh-token") ? refreshed(config) : unauthorized(config)
    );

    await expect(http.get("/project/list")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(calledUrls()).toEqual([
      "/project/list",
      "http://localhost:5000/api/user/refresh-token",
      "/project/list",
    ]);
  });
});

describe("httpService base URL", () => {
  it("uses VITE_BASE_URL when set", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_BASE_URL", "https://api.example.com/api");
    adapter.mockReset().mockImplementation(ok);

    await (await import("./httpService")).default.get("/project/list");

    expect(adapter.mock.calls[0][0].baseURL).toBe("https://api.example.com/api");
  });
});

describe("httpService message translation", () => {
  const otpSent = (config: Config) =>
    response(config, {
      statusCode: 200,
      data: { message: "کد تائید برای شماره موبایل ۰۹۱۲ ارسال گردید", code: "OTP_SENT", phoneNumber: "0912" },
    });

  beforeEach(() => {
    adapter.mockReset();
  });

  it("keeps the server's Persian message in fa", async () => {
    adapter.mockImplementationOnce(otpSent);
    const res = await http.post("/user/get-otp");
    expect(res.data.data.message).toBe("کد تائید برای شماره موبایل ۰۹۱۲ ارسال گردید");
  });

  it("translates success and error messages by code in en", async () => {
    await i18n.changeLanguage("en");
    adapter.mockImplementationOnce(otpSent);
    const res = await http.post("/user/get-otp");
    expect(res.data.data.message).toBe("Verification code sent to 0912");

    adapter.mockImplementationOnce(unauthorized).mockImplementationOnce((config) =>
      response(config, { statusCode: 200, data: { user: null } })
    );
    await expect(http.get("/project/list")).rejects.toMatchObject({
      response: { data: { code: "INVALID_TOKEN", message: "Invalid token" } },
    });
  });

  it("falls back to the server message for an unknown code", async () => {
    await i18n.changeLanguage("en");
    adapter.mockImplementationOnce((config) =>
      response(config, { statusCode: 200, data: { message: "پیام", code: "NOT_A_CODE" } })
    );
    const res = await http.post("/x");
    expect(res.data.data.message).toBe("پیام");
  });
});

import axios, { AxiosError } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// One fake adapter sees every request: the app instance and the bare
// axios.get used for refresh. It must be set before httpService calls axios.create.
const adapter = vi.fn();
axios.defaults.adapter = adapter;

let http;
beforeAll(async () => {
  http = (await import("./httpService")).default;
});

const ok = async (config) => ({ data: { data: "ok" }, status: 200, statusText: "OK", headers: {}, config });
const unauthorized = (config) =>
  Promise.reject(
    new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, {
      data: {},
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
      .mockImplementationOnce(ok)
      .mockImplementationOnce(ok);

    const res = await http.get("/project/list");

    expect(res.data.data).toBe("ok");
    expect(calledUrls()).toEqual([
      "/project/list",
      "https://freelancer-bc.runflare.run/api/user/refresh-token",
      "/project/list",
    ]);
  });

  it("does not loop when the replay gets a second 401", async () => {
    adapter.mockImplementation((config) =>
      config.url.endsWith("/user/refresh-token") ? ok(config) : unauthorized(config)
    );

    await expect(http.get("/project/list")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(calledUrls()).toEqual([
      "/project/list",
      "https://freelancer-bc.runflare.run/api/user/refresh-token",
      "/project/list",
    ]);
  });
});

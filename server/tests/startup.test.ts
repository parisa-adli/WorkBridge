import express from "express";
import mongoose from "mongoose";
import type { MockInstance } from "vitest";
import Application from "../app/server";
import { UserModel } from "../app/models/user";

let listen: MockInstance<typeof express.application.listen>;
let exit: MockInstance<typeof process.exit>;
let error: MockInstance<typeof console.error>;

// The mocks return nothing; the app never reads listen()'s server or relies on exit() not returning.
beforeEach(() => {
  process.env.APP_DB = "mongodb://localhost:27017/startup-test";
  listen = vi.spyOn(express.application, "listen").mockImplementation(() => undefined as never);
  exit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("Application.start", () => {
  it("exits with a clear message when required env vars are missing", async () => {
    const connect = vi.spyOn(mongoose, "connect");
    delete process.env.APP_DB;
    const secret = process.env.ACCESS_TOKEN_SECRET_KEY;
    delete process.env.ACCESS_TOKEN_SECRET_KEY;
    try {
      await new Application().start();
    } finally {
      process.env.ACCESS_TOKEN_SECRET_KEY = secret;
    }

    expect(exit).toHaveBeenCalledWith(1);
    expect(error.mock.calls[0].join(" ")).toContain("Missing required env vars: APP_DB, ACCESS_TOKEN_SECRET_KEY");
    expect(connect).not.toHaveBeenCalled();
    expect(listen).not.toHaveBeenCalled();
  });

  it("exits without listening when Mongo fails to connect", async () => {
    vi.spyOn(mongoose, "connect").mockRejectedValueOnce(new Error("connection refused"));
    await new Application().start();

    expect(exit).toHaveBeenCalledWith(1);
    expect(error.mock.calls[0].join(" ")).toContain("connection refused");
    expect(listen).not.toHaveBeenCalled();
  });

  it("listens only after Mongo connects", async () => {
    const order: string[] = [];
    vi.spyOn(mongoose, "connect").mockImplementationOnce(async () => {
      order.push("connect");
      return mongoose;
    });
    const seed = vi.spyOn(UserModel, "updateOne");
    listen.mockImplementation(() => {
      order.push("listen");
      return undefined as never;
    });
    await new Application().start();

    expect(order).toEqual(["connect", "listen"]);
    expect(exit).not.toHaveBeenCalled();
    expect(seed).not.toHaveBeenCalled(); // demo users come from `npm run seed`, not startup
  });

  it.each(["", "yes"])("exits when DEMO_LOGIN_ENABLED is %j", async (value) => {
    const connect = vi.spyOn(mongoose, "connect");
    process.env.DEMO_LOGIN_ENABLED = value;
    try {
      await new Application().start();
    } finally {
      process.env.DEMO_LOGIN_ENABLED = "true";
    }

    expect(exit).toHaveBeenCalledWith(1);
    expect(error.mock.calls[0].join(" ")).toMatch(/DEMO_LOGIN_ENABLED/);
    expect(connect).not.toHaveBeenCalled();
  });
});

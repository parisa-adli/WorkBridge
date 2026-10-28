const express = require("express");
const mongoose = require("mongoose");
const Application = require("../app/server");
const { UserModel } = require("../app/models/user");

let listen, exit, error;

beforeEach(() => {
  process.env.APP_DB = "mongodb://localhost:27017/startup-test";
  listen = vi.spyOn(express.application, "listen").mockImplementation(() => {});
  exit = vi.spyOn(process, "exit").mockImplementation(() => {});
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
    const order = [];
    vi.spyOn(mongoose, "connect").mockImplementationOnce(async () => order.push("connect"));
    vi.spyOn(UserModel, "updateOne").mockResolvedValue({}); // demo-user seeding, no real DB here
    listen.mockImplementation(() => order.push("listen"));
    await new Application().start();

    expect(order).toEqual(["connect", "listen"]);
    expect(exit).not.toHaveBeenCalled();
  });
});

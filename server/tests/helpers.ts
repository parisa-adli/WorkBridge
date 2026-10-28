import express, { type Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserModel } from "../app/models/user";
import { CategoryModel } from "../app/models/category";
import Application from "../app/server";

let mongod: MongoMemoryServer;

export type TestUser = Awaited<ReturnType<typeof createUser>>;

export async function startApp() {
  mongod = await MongoMemoryServer.create();
  process.env.APP_DB = mongod.getUri();

  // Application keeps the express app private: capture it at listen() instead of opening a port.
  // nothing reads the server listen() would return
  const listen = vi.spyOn(express.application, "listen").mockImplementation(() => undefined as never);
  await new Application().start();
  return listen.mock.contexts[0] as Express;
}

export async function stopApp() {
  await mongoose.disconnect();
  await mongod.stop();
}

export async function clearDb() {
  // startApp has connected, so db is set
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

// Goes through the real OTP flow and returns an agent holding the auth cookies.
export async function login(app: Express, phoneNumber: string) {
  const agent = request.agent(app);
  await agent.post("/api/user/get-otp").send({ phoneNumber }).expect(200);
  const { otp } = (await UserModel.findOne({ phoneNumber }))!;
  await agent
    .post("/api/user/check-otp")
    .send({ phoneNumber, otp: String(otp!.code) })
    .expect(200);
  return agent;
}

// A logged-in user with a completed profile. ADMIN can't be picked in complete-profile, so it is set in the DB.
export async function createUser(
  app: Express,
  { phoneNumber, role, status = 2 }: { phoneNumber: string; role: string; status?: number }
) {
  const agent = await login(app, phoneNumber);
  await agent
    .post("/api/user/complete-profile")
    .send({
      name: `user ${phoneNumber}`,
      email: `${phoneNumber}@test.com`,
      role: role === "ADMIN" ? "OWNER" : role,
    })
    .expect(200);
  const user = (await UserModel.findOneAndUpdate(
    { phoneNumber },
    { $set: { role, status } },
    { returnDocument: "after" }
  ))!;
  return { agent, user };
}

export function createCategory(englishTitle = "web") {
  return CategoryModel.create({
    title: `دسته ${englishTitle}`,
    englishTitle,
    description: "category",
  });
}

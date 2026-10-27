const express = require("express");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { UserModel } = require("../app/models/user");
const { CategoryModel } = require("../app/models/category");

let mongod;

async function startApp() {
  mongod = await MongoMemoryServer.create();
  process.env.APP_DB = mongod.getUri();

  // Application listens in its constructor and keeps the express app private: capture it instead of opening a port.
  let app;
  vi.spyOn(express.application, "listen").mockImplementation(function () {
    app = this;
  });
  const Application = require("../app/server");
  new Application();
  await mongoose.connection.asPromise();
  return app;
}

async function stopApp() {
  await mongoose.disconnect();
  await mongod.stop();
}

async function clearDb() {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

// Goes through the real OTP flow and returns an agent holding the auth cookies.
async function login(app, phoneNumber) {
  const agent = request.agent(app);
  await agent.post("/api/user/get-otp").send({ phoneNumber }).expect(200);
  const { otp } = await UserModel.findOne({ phoneNumber });
  await agent
    .post("/api/user/check-otp")
    .send({ phoneNumber, otp: String(otp.code) })
    .expect(200);
  return agent;
}

// A logged-in user with a completed profile. ADMIN can't be picked in complete-profile, so it is set in the DB.
async function createUser(app, { phoneNumber, role, status = 2 }) {
  const agent = await login(app, phoneNumber);
  await agent
    .post("/api/user/complete-profile")
    .send({
      name: `user ${phoneNumber}`,
      email: `${phoneNumber}@test.com`,
      role: role === "ADMIN" ? "OWNER" : role,
    })
    .expect(200);
  const user = await UserModel.findOneAndUpdate(
    { phoneNumber },
    { $set: { role, status } },
    { new: true }
  );
  return { agent, user };
}

function createCategory(englishTitle = "web") {
  return CategoryModel.create({
    title: `دسته ${englishTitle}`,
    englishTitle,
    description: "category",
  });
}

module.exports = { startApp, stopApp, clearDb, login, createUser, createCategory };

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
// const allRoutes = require("./router/router");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const createError = require("http-errors");
const path = require("path");
const { allRoutes } = require("./router/router");
dotenv.config();

const REQUIRED_ENV = [
  "APP_DB",
  "ACCESS_TOKEN_SECRET_KEY",
  "REFRESH_TOKEN_SECRET_KEY",
  "COOKIE_PARSER_SECRET_KEY",
  "ALLOW_CORS_ORIGIN",
];

class Application {
  #app = express();

  constructor() {
    this.configServer();
    this.initClientSession();
    this.configRoutes();
    this.errorHandling();
  }
  // Checks env and connects to Mongo before listening; exits the process if either fails.
  async start() {
    try {
      const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
      if (missing.length)
        throw new Error(`Missing required env vars: ${missing.join(", ")}`);
      await this.connectToDB();
      this.createServer();
    } catch (err) {
      console.error("Server failed to start:", err.message);
      process.exit(1);
    }
  }
  createServer() {
    const port = process.env.PORT || 5000;
    this.#app.listen(port, () => console.log(`listening on port ${port}`));
  }
  async connectToDB() {
    await mongoose.connect(process.env.APP_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected!!");
  }
  configServer() {
    // The client runs on another origin, so uploaded files must be loadable cross-origin.
    this.#app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
    this.#app.use(
      cors({ credentials: true, origin: process.env.ALLOW_CORS_ORIGIN })
    );
    this.#app.use(express.json({ limit: "100kb" }));
    this.#app.use(express.urlencoded({ extended: true, limit: "100kb" }));
    this.#app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
  }
  initClientSession() {
    this.#app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));
  }
  configRoutes() {
    this.#app.use("/api", allRoutes);
  }
  errorHandling() {
    this.#app.use((req, res, next) => {
      next(createError.NotFound("آدرس مورد نظر یافت نشد"));
    });
    // Express treats a handler as an error handler only when it takes 4 args.
    // eslint-disable-next-line no-unused-vars
    this.#app.use((error, req, res, next) => {
      const serverError = createError.InternalServerError();
      const statusCode = error.status || serverError.status;
      const message = error.message || serverError.message;
      return res.status(statusCode).json({
        statusCode,
        message,
      });
    });
  }
}

module.exports = Application;

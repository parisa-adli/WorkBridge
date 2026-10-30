import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";
import createError from "http-errors";
import path from "path";
import { allRoutes } from "./router/router";
import { apiError, type ApiErrorResponse } from "../utils/apiResponse";
import { ERROR_CODES, type ErrorCode } from "../utils/errorCodes";
dotenv.config();

const REQUIRED_ENV = [
  "APP_DB",
  "ACCESS_TOKEN_SECRET_KEY",
  "REFRESH_TOKEN_SECRET_KEY",
  "COOKIE_PARSER_SECRET_KEY",
  "ALLOW_CORS_ORIGIN",
  "DEMO_LOGIN_ENABLED",
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
      if (!["true", "false"].includes(process.env.DEMO_LOGIN_ENABLED!))
        throw new Error("DEMO_LOGIN_ENABLED must be true or false");
      await this.connectToDB();
      this.createServer();
    } catch (err) {
      console.error("Server failed to start:", (err as Error).message);
      process.exit(1);
    }
  }
  createServer() {
    const port = process.env.PORT || 5000;
    this.#app.listen(port, () => console.log(`listening on port ${port}`));
  }
  async connectToDB() {
    // Keep unknown filter keys in queries (Mongoose 7+ default) so they match nothing instead of being dropped.
    mongoose.set("strictQuery", false);
    // start() has checked APP_DB is set.
    await mongoose.connect(process.env.APP_DB!);
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
    // Express 5 leaves req.body undefined when nothing was parsed; controllers destructure it, so keep Express 4's {}.
    this.#app.use((req, res, next) => {
      req.body ??= {};
      next();
    });
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
      next(apiError(404, ERROR_CODES.ROUTE_NOT_FOUND, "آدرس مورد نظر یافت نشد"));
    });
    // Express treats a handler as an error handler only when it takes 4 args.
    this.#app.use(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (error: { status?: number; message?: string; code?: unknown; field?: unknown }, req: Request, res: Response, next: NextFunction) => {
        const serverError = createError.InternalServerError();
        const statusCode = error.status || serverError.status;
        const message = error.message || serverError.message;
        // Errors from outside our code (body parser, Mongoose, Node) carry no code, or a foreign one.
        const code = Object.hasOwn(ERROR_CODES, String(error.code))
          ? (error.code as ErrorCode)
          : statusCode < 500
            ? ERROR_CODES.BAD_REQUEST
            : ERROR_CODES.INTERNAL_ERROR;
        const body: ApiErrorResponse = { statusCode, code, message };
        if (typeof error.field === "string") body.field = error.field;
        return res.status(statusCode).json(body);
      }
    );
  }
}

export default Application;

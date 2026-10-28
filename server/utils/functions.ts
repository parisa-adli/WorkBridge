import bcrypt from "bcryptjs";
import { apiError } from "./apiResponse";
import { ERROR_CODES, type ErrorCode } from "./errorCodes";
import JWT, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import type { CookieOptions, Request, Response } from "express";
import { UserModel } from "../app/models/user";
import { CategoryModel } from "../app/models/category";
import { DEMO_USERNAMES, PROJECT_STATUS } from "./constants";

export function toPersianDigits(n: number | string) {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}

// shared by login and logout, so both set the same flags
export function cookieOptions(env = process.env): CookieOptions {
  return {
    httpOnly: true, // The cookie only accessible by the web server
    signed: true, // Indicates if the cookie should be signed
    // Express types only list lowercase values; cookie() lowercases it anyway, and the tests pin "Lax".
    sameSite: "Lax" as string as CookieOptions["sameSite"],
    secure: env.NODE_ENV !== "development",
    domain: env.DOMAIN,
  };
}

type TokenUser = { _id: unknown };

export async function setAccessToken(res: Response, user: TokenUser) {
  res.cookie(
    "accessToken",
    await generateToken(user, "1d", process.env.ACCESS_TOKEN_SECRET_KEY),
    { ...cookieOptions(), maxAge: 1000 * 60 * 60 * 24 } // 1 day
  );
}

export async function setRefreshToken(res: Response, user: TokenUser) {
  res.cookie(
    "refreshToken",
    await generateToken(user, "1y", process.env.REFRESH_TOKEN_SECRET_KEY),
    { ...cookieOptions(), maxAge: 1000 * 60 * 60 * 24 * 365 } // 1 year
  );
}

export async function findByIdOr404<T>(
  Model: mongoose.Model<T>,
  id: unknown,
  notFoundCode: ErrorCode,
  notFoundMessage: string
) {
  if (!mongoose.isValidObjectId(id))
    throw apiError(400, ERROR_CODES.INVALID_ID, "شناسه ارسال شده صحیح نمیباشد");
  const doc = await Model.findById(id);
  if (!doc) throw apiError(404, notFoundCode, notFoundMessage);
  return doc;
}

// user input used inside a RegExp must match literally
export function escapeRegex(text: unknown) {
  return String(text ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createdAtSort(sort: unknown) {
  return { createdAt: sort === "latest" ? -1 : 1 } as const;
}

type ProjectQuery = { search?: unknown; category?: unknown; sort?: unknown; status?: unknown };

// filter and sort for both project list endpoints, built from req.query
export async function buildProjectQuery({ search, category, sort, status }: ProjectQuery) {
  const filter: Record<string, unknown> = {};
  if (search) filter.title = new RegExp(escapeRegex(search), "i");
  if ((Object.values(PROJECT_STATUS) as unknown[]).includes(status)) filter.status = { $eq: status };
  if (category) {
    if (typeof category !== "string")
      throw apiError(400, ERROR_CODES.INVALID_CATEGORY, "دسته بندی مورد نظر صحیح نمی باشد");
    if (!category.includes("ALL")) {
      const titles = category.split(",");
      const categories = await CategoryModel.find({
        englishTitle: { $in: titles },
      });
      if (titles.some((t) => !categories.some((c) => c.englishTitle === t)))
        throw apiError(400, ERROR_CODES.CATEGORY_NOT_FOUND, "دسته بندی مورد نظر یافت نشد");
      filter.category = { $in: categories.map((c) => c._id) };
    }
  }
  return { filter, sort: createdAtSort(sort) };
}

function generateToken(user: TokenUser, expiresIn: SignOptions["expiresIn"], secret?: string) {
  return new Promise<string | undefined>((resolve, reject) => {
    const payload = {
      _id: user._id,
    };

    const options = {
      expiresIn,
    };

    // An empty secret fails in JWT.sign exactly like a missing one.
    JWT.sign(
      payload,
      secret || process.env.TOKEN_SECRET_KEY || "",
      options,
      (err, token) => {
        if (err) reject(apiError(500, ERROR_CODES.TOKEN_NOT_CREATED, "خطای سروری"));
        resolve(token);
      }
    );
  });
}
export function verifyRefreshToken(req: Request) {
  const refreshToken = req.signedCookies["refreshToken"];
  if (!refreshToken) {
    throw apiError(401, ERROR_CODES.LOGIN_REQUIRED, "لطفا وارد حساب کاربری خود شوید.");
  }
  const token = cookieParser.signedCookie(
    refreshToken,
    process.env.COOKIE_PARSER_SECRET_KEY ?? ""
  );
  return new Promise((resolve, reject) => {
    JWT.verify(
      token || "",
      process.env.REFRESH_TOKEN_SECRET_KEY ?? "",
      async (err, payload) => {
        try {
          if (err)
            reject(apiError(401, ERROR_CODES.LOGIN_REQUIRED, "لطفا حساب کاربری خود شوید"));
          const { _id } = payload as JwtPayload;
          const user = await UserModel.findById(_id, {
            password: 0,
            otp: 0,
            resetLink: 0,
          });
          if (!user) reject(apiError(401, ERROR_CODES.ACCOUNT_NOT_FOUND, "حساب کاربری یافت نشد"));
          return resolve(_id);
        } catch {
          reject(apiError(401, ERROR_CODES.ACCOUNT_NOT_FOUND, "حساب کاربری یافت نشد"));
        }
      }
    );
  });
}

export function copyObject<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}

// bcrypt (PRD F1); the hash carries its own salt and cost.
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, stored: string) {
  return bcrypt.compare(password, stored);
}

// The shared demo accounts are locked: their role and status never change (PRD F1).
export function isDemoUser(user: { username?: string | null }) {
  return DEMO_USERNAMES.includes(user.username ?? "");
}

// The file extension of a jpg, png or webp image, read from its magic bytes (the Content-Type is the client's claim).
export function imageExtension(body: unknown) {
  if (!Buffer.isBuffer(body)) return null;
  if (body.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "jpg";
  if (body.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (body.toString("latin1", 0, 4) === "RIFF" && body.toString("latin1", 8, 12) === "WEBP") return "webp";
  return null;
}

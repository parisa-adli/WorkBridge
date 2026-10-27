import cookieParser from "cookie-parser";
import { apiError } from "../../../utils/apiResponse";
import { ERROR_CODES } from "../../../utils/errorCodes";
import JWT, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { UserModel } from "../../models/user";
import { STATUS } from "../../../utils/constants";

export async function verifyAccessToken(req: Request, res: Response, next: NextFunction) {
  try {
    const accessToken = req.signedCookies["accessToken"];
    if (!accessToken) {
      throw apiError(401, ERROR_CODES.LOGIN_REQUIRED, "لطفا وارد حساب کاربری خود شوید.");
    }
    const token = cookieParser.signedCookie(
      accessToken,
      process.env.COOKIE_PARSER_SECRET_KEY ?? ""
    );
    JWT.verify(
      token || "",
      process.env.ACCESS_TOKEN_SECRET_KEY ?? "",
      async (err, payload) => {
        try {
          if (err) throw apiError(401, ERROR_CODES.INVALID_TOKEN, "توکن نامعتبر است");
          const { _id } = payload as JwtPayload;
          const user = await UserModel.findById(_id, {
            password: 0,
            otp: 0,
          });
          if (!user) throw apiError(401, ERROR_CODES.ACCOUNT_NOT_FOUND, "حساب کاربری یافت نشد");
          req.user = user;
          return next();
        } catch (error) {
          next(error);
        }
      }
    );
  } catch (error) {
    next(error);
  }
}

export async function isVerifiedUser(req: Request, res: Response, next: NextFunction) {
  try {
    // Runs after verifyAccessToken, which sets req.user; a missing user still lands in catch.
    const user = req.user!;
    if (user.status === STATUS.PENDING) {
      throw apiError(403, ERROR_CODES.PROFILE_PENDING, "پروفایل شما در انتظار بررسی است.");
    }
    if (user.status !== STATUS.ACCEPTED) {
      throw apiError(
        403,
        ERROR_CODES.PROFILE_REJECTED,
        "پروفایل شما مورد تایید قرار نگرفته است."
      );
    }
    return next();
  } catch (error) {
    next(error);
  }
}

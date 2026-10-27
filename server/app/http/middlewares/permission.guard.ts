import createError from "http-errors";
import type { RequestHandler } from "express";
import { UserModel } from "../../models/user";

export function authorize(...allowedRoles: string[]): RequestHandler {
  return async function (req, res, next) {
    try {
      // Runs after verifyAccessToken, which sets req.user; a missing user still lands in catch.
      const userId = req.user!._id;
      const user = await UserModel.findById(userId);
      if (allowedRoles.length === 0 || allowedRoles.includes(user!.role))
        return next();
      throw createError.Forbidden("شما به این قسمت دسترسی ندارید");
    } catch (error) {
      next(error);
    }
  };
}

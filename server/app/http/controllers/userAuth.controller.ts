import crypto from "crypto";
import type { Request, Response } from "express";
import createError from "http-errors";
import { StatusCodes as HttpStatus } from "http-status-codes";
import Controller from "./controller";
import {
  toPersianDigits,
  setAccessToken,
  setRefreshToken,
  verifyRefreshToken,
  cookieOptions,
} from "../../../utils/functions";
import { UserModel } from "../../models/user";
import {
  completeProfileSchema,
  updateProfileSchema,
  checkOtpSchema,
  getOtpSchema,
} from "../validators/user.schema";
const CODE_EXPIRES = 90 * 1000; //90 seconds in miliseconds

const showOtp = () => process.env.NODE_ENV !== "production";

class userAuthController extends Controller {
  async getOtp(req: Request, res: Response) {
    let { phoneNumber } = req.body;

    if (!phoneNumber)
      throw createError.BadRequest("شماره موبایل معتبر را وارد کنید");

    phoneNumber = String(phoneNumber).trim();
    await getOtpSchema.validateAsync({ phoneNumber });
    const code = crypto.randomInt(100000, 1000000);

    const result = await this.saveUser(phoneNumber, code);
    if (!result) throw createError.Unauthorized("ورود شما انجام نشد.");

    // send OTP
    this.sendOTP(phoneNumber, code, res);
  }
  async checkOtp(req: Request, res: Response) {
    await checkOtpSchema.validateAsync(req.body);
    const { otp: code, phoneNumber } = req.body;

    const user = await UserModel.findOne(
      { phoneNumber },
      { password: 0, refreshToken: 0, accessToken: 0 }
    );

    if (!user) throw createError.NotFound("کاربری با این مشخصات یافت نشد");

    if (!user.otp?.code || String(user.otp.code) !== code)
      throw createError.BadRequest("کد ارسال شده صحیح نمیباشد");

    if (new Date(`${user.otp.expiresIn}`).getTime() < Date.now())
      throw createError.BadRequest("کد اعتبار سنجی منقضی شده است");

    user.isVerifiedPhoneNumber = true;
    user.set("otp.code", null); // single use
    await user.save();

    // await setAuthCookie(res, user); // set httpOnly cookie
    await setAccessToken(res, user);
    await setRefreshToken(res, user);
    let WELLCOME_MESSAGE = `کد تایید شد، به سایت freelancer خوش آمدید`;
    if (!user.isActive)
      WELLCOME_MESSAGE = `کد تایید شد، لطفا اطلاعات خود را تکمیل کنید`;

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: WELLCOME_MESSAGE,
        user,
      },
    });
  }
  async saveUser(phoneNumber: string, code: number) {
    const otp = {
      code,
      expiresIn: Date.now() + CODE_EXPIRES,
    };

    const user = await this.checkUserExist(phoneNumber);
    if (user) return await this.updateUser(phoneNumber, { otp });

    return await UserModel.create({
      phoneNumber,
      otp,
    });
  }
  async checkUserExist(phoneNumber: string) {
    const user = await UserModel.findOne({ phoneNumber });
    return user;
  }
  async updateUser(phoneNumber: string, objectData: Record<string, unknown> = {}) {
    Object.keys(objectData).forEach((key) => {
      if (([""," ", 0, null, undefined, "0", NaN] as unknown[]).includes(objectData[key]))
        delete objectData[key];
    });
    const updatedResult = await UserModel.updateOne(
      { phoneNumber },
      { $set: objectData }
    );
    return !!updatedResult.modifiedCount;
  }
  sendOTP(phoneNumber: string, code: number, res: Response) {
    // no SMS provider: outside production, print the code and return it so login still works (PRD R1)
    if (showOtp()) console.log(`OTP for ${phoneNumber}: ${code}`);
    return res.status(HttpStatus.OK).send({
      statusCode: HttpStatus.OK,
      data: {
        message: `کد تائید برای شماره موبایل ${toPersianDigits(
          phoneNumber
        )} ارسال گردید`,
        expiresIn: CODE_EXPIRES,
        phoneNumber,
        ...(showOtp() && { code }),
      },
    });
  }
  async completeProfile(req: Request, res: Response) {
    await completeProfileSchema.validateAsync(req.body);
    // the route runs verifyAccessToken first, which sets req.user
    const user = req.user!;
    const { name, email, role } = req.body;

    if (!user.isVerifiedPhoneNumber)
      throw createError.Forbidden("شماره موبایل خود را تایید کنید.");

    const duplicateUser =
      email && (await UserModel.findOne({ email, _id: { $ne: user._id } }));
    if (duplicateUser)
      throw createError.BadRequest(
        "کاربری با این ایمیل قبلا ثبت نام کرده است."
      );

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { name, email, isActive: true, role } },
      { returnDocument: "after" }
    );
    // req.user was loaded from the DB in this request, so the update finds it
    await setAccessToken(res, updatedUser!);
    await setRefreshToken(res, updatedUser!);

    return res.status(HttpStatus.OK).send({
      statusCode: HttpStatus.OK,
      data: {
        message: "اطلاعات شما با موفقیت تکمیل شد",
        user: updatedUser,
      },
    });
  }
  async updateProfile(req: Request, res: Response) {
    // the route runs verifyAccessToken first, which sets req.user
    const { _id: userId } = req.user!;
    await updateProfileSchema.validateAsync(req.body);
    const { name, email, biography, phoneNumber } = req.body;

    // No "nothing changed" check: timestamps bump updatedAt, so modifiedCount is never 0 (known-bugs.md).
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: { name, email, biography, phoneNumber },
      }
    );
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "اطلاعات با موفقیت آپدیت شد",
      },
    });
  }
  async refreshToken(req: Request, res: Response) {
    const userId = await verifyRefreshToken(req);
    const user = await UserModel.findById(userId);
    // verifyRefreshToken rejects when the user is gone; a null here still throws, as it did in JS
    await setAccessToken(res, user!);
    await setRefreshToken(res, user!);
    return res.status(HttpStatus.OK).json({
      StatusCode: HttpStatus.OK,
      data: {
        user,
      },
    });
  }
  async getUserProfile(req: Request, res: Response) {
    // the route runs verifyAccessToken first, which sets req.user
    const { _id: userId } = req.user!;
    const user = await UserModel.findById(userId, { otp: 0 });

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        user,
      },
    });
  }
  logout(req: Request, res: Response) {
    const options = {
      ...cookieOptions(),
      maxAge: 1,
      expires: new Date(), // res.cookie replaces it from maxAge anyway
      path: "/",
    };
    res.cookie("accessToken", null, options);
    res.cookie("refreshToken", null, options);

    return res.status(HttpStatus.OK).json({
      StatusCode: HttpStatus.OK,
      roles: null,
      auth: false,
    });
  }
}

const userAuthControllerInstance = new userAuthController();
export { userAuthControllerInstance as UserAuthController };

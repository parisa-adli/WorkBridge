const crypto = require("crypto");
const Controller = require("./controller");
const {
  toPersianDigits,
  setAccessToken,
  setRefreshToken,
  verifyRefreshToken,
  cookieOptions,
} = require("../../../utils/functions");
const createError = require("http-errors");
const { UserModel } = require("../../models/user");
const CODE_EXPIRES = 90 * 1000; //90 seconds in miliseconds
const { StatusCodes: HttpStatus } = require("http-status-codes");
const {
  completeProfileSchema,
  updateProfileSchema,
  checkOtpSchema,
  getOtpSchema,
} = require("../validators/user.schema");

const showOtp = () => process.env.NODE_ENV !== "production";

class userAuthController extends Controller {
  async getOtp(req, res) {
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
  async checkOtp(req, res) {
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
    user.otp.code = null; // single use
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
  async saveUser(phoneNumber, code) {
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
  async checkUserExist(phoneNumber) {
    const user = await UserModel.findOne({ phoneNumber });
    return user;
  }
  async updateUser(phoneNumber, objectData = {}) {
    Object.keys(objectData).forEach((key) => {
      if (["", " ", 0, null, undefined, "0", NaN].includes(objectData[key]))
        delete objectData[key];
    });
    const updatedResult = await UserModel.updateOne(
      { phoneNumber },
      { $set: objectData }
    );
    return !!updatedResult.modifiedCount;
  }
  sendOTP(phoneNumber, code, res) {
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
  async completeProfile(req, res) {
    await completeProfileSchema.validateAsync(req.body);
    const { user } = req;
    const { name, email, role } = req.body;

    if (!user.isVerifiedPhoneNumber)
      throw createError.Forbidden("شماره موبایل خود را تایید کنید.");

    const duplicateUser = await UserModel.findOne({ email });
    console.log(duplicateUser);
    if (duplicateUser)
      throw createError.BadRequest(
        "کاربری با این ایمیل قبلا ثبت نام کرده است."
      );

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { name, email, isActive: true, role } },
      { new: true }
    );
    // await setAuthCookie(res, updatedUser);
    await setAccessToken(res, updatedUser);
    await setRefreshToken(res, updatedUser);

    return res.status(HttpStatus.OK).send({
      statusCode: HttpStatus.OK,
      data: {
        message: "اطلاعات شما با موفقیت تکمیل شد",
        user: updatedUser,
      },
    });
  }
  async updateProfile(req, res) {
    const { _id: userId } = req.user;
    await updateProfileSchema.validateAsync(req.body);
    const { name, email, biography, phoneNumber } = req.body;

    const updateResult = await UserModel.updateOne(
      { _id: userId },
      {
        $set: { name, email, biography, phoneNumber },
      }
    );
    if (!updateResult.modifiedCount === 0)
      throw createError.BadRequest("اطلاعات ویرایش نشد");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "اطلاعات با موفقیت آپدیت شد",
      },
    });
  }
  async refreshToken(req, res) {
    const userId = await verifyRefreshToken(req);
    const user = await UserModel.findById(userId);
    await setAccessToken(res, user);
    await setRefreshToken(res, user);
    return res.status(HttpStatus.OK).json({
      StatusCode: HttpStatus.OK,
      data: {
        user,
      },
    });
  }
  async getUserProfile(req, res) {
    const { _id: userId } = req.user;
    const user = await UserModel.findById(userId, { otp: 0 });

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        user,
      },
    });
  }
  logout(req, res) {
    const options = {
      ...cookieOptions(),
      maxAge: 1,
      expires: Date.now(),
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

module.exports = {
  UserAuthController: new userAuthController(),
};

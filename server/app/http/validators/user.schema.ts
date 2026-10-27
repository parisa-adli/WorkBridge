import Joi from "joi";
import { ROLES, STATUS } from "../../../utils/constants";
import { apiError } from "../../../utils/apiResponse";
import { ERROR_CODES } from "../../../utils/errorCodes";

const invalidPhone = () =>
  apiError(400, ERROR_CODES.INVALID_PHONE, "شماره موبایل وارد شده صحیح نمیباشد");
const invalidName = () =>
  apiError(400, ERROR_CODES.INVALID_NAME, "نام کاربری وارد شده صحیح نمی باشد");
const invalidEmail = () =>
  apiError(400, ERROR_CODES.INVALID_EMAIL, "ایمیل وارد شده صحیح نمی باشد");

export const getOtpSchema = Joi.object({
  phoneNumber: Joi.string()
    .length(11)
    .pattern(/^09[0-9]{9}$/)
    .error(invalidPhone()),
});

export const checkOtpSchema = Joi.object({
  otp: Joi.string()
    .required()
    .min(5)
    .max(6)
    .error(apiError(400, ERROR_CODES.INVALID_OTP, "کد ارسال شده صحیح نمیباشد")),
  phoneNumber: Joi.string()
    .length(11)
    .pattern(/^09[0-9]{9}$/)
    .error(invalidPhone()),
});

export const completeProfileSchema = Joi.object({
  name: Joi.string()
    .min(5)
    .max(100)
    .error(invalidName()),
  email: Joi.string()
    .email()
    .error(invalidEmail()),
  role: Joi.string()
    .required()
    .valid(ROLES.FREELANCER, ROLES.OWNER)
    .error(apiError(400, ERROR_CODES.INVALID_ROLE, "نقش وارد شده صحیح نمی باشد")),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(5)
    .max(50)
    .required()
    .error(invalidName()),
  email: Joi.string()
    .required()
    .email()
    .error(invalidEmail()),
  phoneNumber: Joi.string()
    .length(11)
    .pattern(/^09[0-9]{9}$/)
    .error(invalidPhone()),
  biography: Joi.string()
    .max(30)
    .allow("")
    .error(apiError(400, ERROR_CODES.INVALID_BIOGRAPHY, "حوزه تخصصی صحیح نمی باشد.")),
});

export const verifyUserSchema = Joi.object({
  status: Joi.number()
    .required()
    .valid(...Object.values(STATUS))
    .error(apiError(400, ERROR_CODES.INVALID_USER_STATUS, "وضعیت کاربر صحیح نمی باشد")),
});

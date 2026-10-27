import Joi from "joi";
import createHttpError from "http-errors";
import { ROLES, STATUS } from "../../../utils/constants";

export const getOtpSchema = Joi.object({
  phoneNumber: Joi.string()
    .length(11)
    .pattern(/^09[0-9]{9}$/)
    .error(createHttpError.BadRequest("شماره موبایل وارد شده صحیح نمیباشد")),
});

export const checkOtpSchema = Joi.object({
  otp: Joi.string()
    .required()
    .min(5)
    .max(6)
    .error(createHttpError.BadRequest("کد ارسال شده صحیح نمیباشد")),
  phoneNumber: Joi.string()
    .length(11)
    .pattern(/^09[0-9]{9}$/)
    .error(createHttpError.BadRequest("شماره موبایل وارد شده صحیح نمیباشد")),
});

export const completeProfileSchema = Joi.object({
  name: Joi.string()
    .min(5)
    .max(100)
    .error(createHttpError.BadRequest("نام کاربری وارد شده صحیح نمی باشد")),
  email: Joi.string()
    .email()
    .error(createHttpError.BadRequest("ایمیل وارد شده صحیح نمی باشد")),
  role: Joi.string()
    .required()
    .valid(ROLES.FREELANCER, ROLES.OWNER)
    .error(createHttpError.BadRequest("نقش وارد شده صحیح نمی باشد")),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(5)
    .max(50)
    .required()
    .error(createHttpError.BadRequest("نام کاربری وارد شده صحیح نمی باشد")),
  email: Joi.string()
    .required()
    .email()
    .error(createHttpError.BadRequest("ایمیل وارد شده صحیح نمی باشد")),
  phoneNumber: Joi.string()
    .length(11)
    .pattern(/^09[0-9]{9}$/)
    .error(createHttpError.BadRequest("شماره موبایل وارد شده صحیح نمیباشد")),
  biography: Joi.string()
    .max(30)
    .allow("")
    .error(createHttpError.BadRequest("حوزه تخصصی صحیح نمی باشد.")),
});

export const verifyUserSchema = Joi.object({
  status: Joi.number()
    .required()
    .valid(...Object.values(STATUS))
    .error(createHttpError.BadRequest("وضعیت کاربر صحیح نمی باشد")),
});


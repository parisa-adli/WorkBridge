import { z } from "zod";
import { LIMITS, PHONE_PATTERN, ROLES, STATUS } from "../../../utils/constants";
import { ERROR_CODES } from "../../../utils/errorCodes";
import { issue } from "../middlewares/validate";
import { numeric, searchQuery } from "./common.schema";

const invalidPhone = issue(ERROR_CODES.INVALID_PHONE, "شماره موبایل وارد شده صحیح نمیباشد");
const invalidOtp = issue(ERROR_CODES.INVALID_OTP, "کد ارسال شده صحیح نمیباشد");
const invalidName = issue(ERROR_CODES.INVALID_NAME, "نام کاربری وارد شده صحیح نمی باشد");
const invalidEmail = issue(ERROR_CODES.INVALID_EMAIL, "ایمیل وارد شده صحیح نمی باشد");

const phoneNumber = z.string(invalidPhone).regex(PHONE_PATTERN, invalidPhone);

export const getOtpSchema = z.object({
  // any falsy value counts as missing; anything else is read as a trimmed string
  phoneNumber: z.preprocess(
    (value) => (value ? String(value).trim() : undefined),
    z
      .string(issue(ERROR_CODES.PHONE_REQUIRED, "شماره موبایل معتبر را وارد کنید"))
      .regex(PHONE_PATTERN, invalidPhone)
  ),
});

export const checkOtpSchema = z.object({
  otp: z.string(invalidOtp).min(LIMITS.OTP_MIN, invalidOtp).max(LIMITS.OTP_MAX, invalidOtp),
  phoneNumber: phoneNumber.optional(),
});

export const completeProfileSchema = z.object({
  name: z.string(invalidName).min(LIMITS.NAME_MIN, invalidName).max(LIMITS.NAME_MAX, invalidName).optional(),
  email: z.email(invalidEmail).optional(),
  role: z.enum(
    [ROLES.FREELANCER, ROLES.OWNER],
    issue(ERROR_CODES.INVALID_ROLE, "نقش وارد شده صحیح نمی باشد")
  ),
});

const invalidBiography = issue(ERROR_CODES.INVALID_BIOGRAPHY, "حوزه تخصصی صحیح نمی باشد.");

export const updateProfileSchema = z.object({
  name: z.string(invalidName).min(LIMITS.NAME_MIN, invalidName).max(LIMITS.PROFILE_NAME_MAX, invalidName),
  email: z.email(invalidEmail),
  phoneNumber: phoneNumber.optional(),
  biography: z.string(invalidBiography).max(LIMITS.BIOGRAPHY_MAX, invalidBiography).optional(),
});

export type GetOtpBody = z.infer<typeof getOtpSchema>;
export type CheckOtpBody = z.infer<typeof checkOtpSchema>;
export type CompleteProfileBody = z.infer<typeof completeProfileSchema>;
export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;

export const verifyUserSchema = z.object({
  status: numeric(
    z.literal(Object.values(STATUS), issue(ERROR_CODES.INVALID_USER_STATUS, "وضعیت کاربر صحیح نمی باشد"))
  ),
});

const invalidPage = issue(ERROR_CODES.INVALID_PAGINATION, "صفحه بندی صحیح نمی باشد");
// a positive integer, as the query string sends it
const pageNumber = z.string(invalidPage).regex(/^[1-9]\d*$/, invalidPage).optional();

export const userListQuerySchema = z.object({ search: searchQuery, page: pageNumber, limit: pageNumber });

export type VerifyUserBody = z.infer<typeof verifyUserSchema>;

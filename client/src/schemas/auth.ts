import { z } from "zod";
import { LIMITS, PHONE_PATTERN, ROLES } from "../constants";

// Mirrors server/app/http/validators/user.schema.ts: same limits, same Persian messages.
const invalidPhone = "شماره موبایل وارد شده صحیح نمیباشد";
const invalidOtp = "کد ارسال شده صحیح نمیباشد";
const invalidName = "نام کاربری وارد شده صحیح نمی باشد";

export const sendOtpSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(1, "شماره موبایل معتبر را وارد کنید")
    .regex(PHONE_PATTERN, invalidPhone),
});

export type SendOtpValues = z.infer<typeof sendOtpSchema>;

export const checkOtpSchema = z.object({
  otp: z.string().min(LIMITS.OTP_MIN, invalidOtp).max(LIMITS.OTP_MAX, invalidOtp),
});

export type CheckOtpValues = z.infer<typeof checkOtpSchema>;

// The form asks for name and email (the server leaves both optional), with its own "required" messages.
export const completeProfileSchema = z.object({
  name: z
    .string()
    .min(1, "نام و نام خانوادگی ضروری است")
    .min(LIMITS.NAME_MIN, invalidName)
    .max(LIMITS.NAME_MAX, invalidName),
  email: z.string().min(1, "ایمیل ضروری است").pipe(z.email("ایمیل نامعتبر است")),
  role: z.enum([ROLES.OWNER, ROLES.FREELANCER], "انتخاب نقش ضروری است"),
});

export type CompleteProfileValues = z.infer<typeof completeProfileSchema>;

// The email tab; the server only checks the email format and that a password is sent.
export const loginSchema = z.object({
  role: z.enum([ROLES.OWNER, ROLES.FREELANCER]),
  email: z.string().min(1, "ایمیل ضروری است").pipe(z.email("ایمیل وارد شده صحیح نمی باشد")),
  password: z.string().min(1, "رمز عبور ضروری است"),
});

export type LoginValues = z.infer<typeof loginSchema>;

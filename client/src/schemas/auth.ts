import { z } from "zod";
import { LIMITS, PHONE_PATTERN, ROLES } from "../constants";
import { msg } from "./message";

// Mirrors server/app/http/validators/user.schema.ts: same limits, the same Persian messages (`validation.*` keys in fa).
const invalidPhone = msg("validation.invalidPhone");
const invalidOtp = msg("validation.invalidOtp");
const invalidName = msg("validation.invalidName");

export const sendOtpSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(1, msg("validation.phoneRequired"))
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
    .min(1, msg("validation.fullNameRequired"))
    .min(LIMITS.NAME_MIN, invalidName)
    .max(LIMITS.NAME_MAX, invalidName),
  email: z.string().min(1, msg("validation.emailRequired")).pipe(z.email(msg("validation.invalidEmail"))),
  role: z.enum([ROLES.OWNER, ROLES.FREELANCER], msg("validation.roleRequired")),
});

export type CompleteProfileValues = z.infer<typeof completeProfileSchema>;

// The email tab; the server only checks the email format and that a password is sent.
export const loginSchema = z.object({
  role: z.enum([ROLES.OWNER, ROLES.FREELANCER]),
  email: z.string().min(1, msg("validation.emailRequired")).pipe(z.email(msg("validation.invalidLoginEmail"))),
  password: z.string().min(1, msg("validation.passwordRequired")),
});

export type LoginValues = z.infer<typeof loginSchema>;

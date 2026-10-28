import { describe, expect, it } from "vitest";
import type { z } from "zod";
import { LIMITS } from "../constants";
import { checkOtpSchema, completeProfileSchema, sendOtpSchema } from "./auth";

const firstError = (schema: z.ZodType, data: unknown) => schema.safeParse(data).error?.issues[0].message;

// The limits come from the constants (PRD R8): the edges of each range pass, one past them fails.
describe("auth schemas", () => {
  it("send-OTP: a required, trimmed 09xxxxxxxxx phone", () => {
    expect(firstError(sendOtpSchema, { phoneNumber: "" })).toBe("شماره موبایل معتبر را وارد کنید");
    expect(firstError(sendOtpSchema, { phoneNumber: "0912000000" })).toBe(
      "شماره موبایل وارد شده صحیح نمیباشد"
    );
    expect(sendOtpSchema.parse({ phoneNumber: " 09120000001 " })).toEqual({
      phoneNumber: "09120000001",
    });
  });

  it("check-OTP: the code length follows LIMITS.OTP_MIN..OTP_MAX", () => {
    const otp = (n: number) => ({ otp: "1".repeat(n) });
    expect(checkOtpSchema.safeParse(otp(LIMITS.OTP_MIN)).success).toBe(true);
    expect(checkOtpSchema.safeParse(otp(LIMITS.OTP_MAX)).success).toBe(true);
    expect(firstError(checkOtpSchema, otp(LIMITS.OTP_MIN - 1))).toBe("کد ارسال شده صحیح نمیباشد");
    expect(firstError(checkOtpSchema, otp(LIMITS.OTP_MAX + 1))).toBe("کد ارسال شده صحیح نمیباشد");
  });

  it("complete-profile: name length follows LIMITS.NAME_MIN..NAME_MAX", () => {
    const profile = (n: number) => ({ name: "a".repeat(n), email: "a@b.com", role: "OWNER" });
    expect(completeProfileSchema.safeParse(profile(LIMITS.NAME_MIN)).success).toBe(true);
    expect(completeProfileSchema.safeParse(profile(LIMITS.NAME_MAX)).success).toBe(true);
    expect(firstError(completeProfileSchema, profile(LIMITS.NAME_MIN - 1))).toBe(
      "نام کاربری وارد شده صحیح نمی باشد"
    );
    expect(firstError(completeProfileSchema, profile(LIMITS.NAME_MAX + 1))).toBe(
      "نام کاربری وارد شده صحیح نمی باشد"
    );
  });

  it("complete-profile: the form's required and format messages", () => {
    const valid = { name: "Test User", email: "a@b.com", role: "FREELANCER" };
    expect(firstError(completeProfileSchema, { ...valid, name: "" })).toBe("نام و نام خانوادگی ضروری است");
    expect(firstError(completeProfileSchema, { ...valid, email: "" })).toBe("ایمیل ضروری است");
    expect(firstError(completeProfileSchema, { ...valid, email: "a@b" })).toBe("ایمیل نامعتبر است");
    expect(firstError(completeProfileSchema, { ...valid, role: null })).toBe("انتخاب نقش ضروری است");
    expect(firstError(completeProfileSchema, { ...valid, role: "ADMIN" })).toBe("انتخاب نقش ضروری است");
  });
});

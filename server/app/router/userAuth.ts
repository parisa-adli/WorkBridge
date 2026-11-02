import { Router, raw, type RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import { verifyAccessToken } from "../http/middlewares/user.middleware";
import { UserAuthController } from "../http/controllers/userAuth.controller";
import { ERROR_CODES } from "../../utils/errorCodes";
import { apiError } from "../../utils/apiResponse";
import { validate } from "../http/middlewares/validate";
import {
  checkOtpSchema,
  completeProfileSchema,
  getOtpSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../http/validators/user.schema";

const router = Router();

// One limiter per route, so get-otp and check-otp are counted separately. Tests raise OTP_RATE_LIMIT.
const otpLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.OTP_RATE_LIMIT) || 10,
    message: {
      statusCode: 429,
      code: ERROR_CODES.RATE_LIMITED,
      message: "تعداد درخواست‌ها زیاد است، لطفا چند دقیقه دیگر دوباره تلاش کنید",
    },
  });

router.post("/get-otp", otpLimiter(), validate(getOtpSchema), UserAuthController.getOtp);
router.post("/check-otp", otpLimiter(), validate(checkOtpSchema), UserAuthController.checkOtp);
// Email + password. DEMO_LOGIN_ENABLED=false turns off only the demo accounts (checked in the controller).
router.post("/login", otpLimiter(), validate(loginSchema), UserAuthController.login);
router.post(
  "/complete-profile",
  verifyAccessToken,
  validate(completeProfileSchema),
  UserAuthController.completeProfile
);
router.get("/refresh-token", UserAuthController.refreshToken);
router.patch(
  "/update",
  verifyAccessToken,
  validate(updateProfileSchema),
  UserAuthController.updateProfile
);

// The image is the raw body (Content-Type image/jpeg, png or webp); other types are left unparsed and rejected
// by the controller, which also checks the file's magic bytes.
const avatarBody = raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "2mb" });
const readAvatar: RequestHandler = (req, res, next) =>
  avatarBody(req, res, (err?: { type?: string }) =>
    next(
      err?.type === "entity.too.large"
        ? apiError(413, ERROR_CODES.AVATAR_TOO_LARGE, "حجم تصویر نباید بیشتر از ۲ مگابایت باشد")
        : err
    )
  );

router.patch(
  "/password",
  verifyAccessToken,
  validate(changePasswordSchema),
  UserAuthController.changePassword
);

router.patch("/avatar", verifyAccessToken, readAvatar, UserAuthController.updateAvatar);

router.get("/profile", verifyAccessToken, UserAuthController.getUserProfile);

router.post("/logout", UserAuthController.logout);

export { router as userAuthRoutes };

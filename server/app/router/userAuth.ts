import { Router } from "express";
import { rateLimit } from "express-rate-limit";
// const { uploadFile } = require("../../utils/multer");
import { verifyAccessToken } from "../http/middlewares/user.middleware";
import { UserAuthController } from "../http/controllers/userAuth.controller";
import { ERROR_CODES } from "../../utils/errorCodes";
import { validate } from "../http/middlewares/validate";
import {
  checkOtpSchema,
  completeProfileSchema,
  getOtpSchema,
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

router.get("/profile", verifyAccessToken, UserAuthController.getUserProfile);

router.post("/logout", UserAuthController.logout);

export { router as userAuthRoutes };

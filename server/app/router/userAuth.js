const router = require("express").Router();
const { rateLimit } = require("express-rate-limit");
// const { uploadFile } = require("../../utils/multer");
const { verifyAccessToken } = require("../http/middlewares/user.middleware");
const { UserAuthController } = require("../http/controllers/userAuth.controller");

// One limiter per route, so get-otp and check-otp are counted separately. Tests raise OTP_RATE_LIMIT.
const otpLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.OTP_RATE_LIMIT) || 10,
    message: {
      statusCode: 429,
      message: "تعداد درخواست‌ها زیاد است، لطفا چند دقیقه دیگر دوباره تلاش کنید",
    },
  });

router.post("/get-otp", otpLimiter(), UserAuthController.getOtp);
router.post("/check-otp", otpLimiter(), UserAuthController.checkOtp);
router.post(
  "/complete-profile",
  verifyAccessToken,
  UserAuthController.completeProfile
);
router.get("/refresh-token", UserAuthController.refreshToken);
router.patch("/update", verifyAccessToken, UserAuthController.updateProfile);

router.get("/profile", verifyAccessToken, UserAuthController.getUserProfile);

router.post("/logout", UserAuthController.logout);

module.exports = {
  userAuthRoutes: router,
};

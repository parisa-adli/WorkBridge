import { Router } from "express";
import { ROLES } from "../../utils/constants";
import { authorize } from "../http/middlewares/permission.guard";
import {
  verifyAccessToken,
  isVerifiedUser,
} from "../http/middlewares/user.middleware";
import { adminRoutes } from "./admin/admin.routes";
import { categoryRoutes } from "./category";
import { projectRoutes } from "./project";
import { proposalRoutes } from "./proposal";
import { userAuthRoutes } from "./userAuth";

const router = Router();

router.use("/user", userAuthRoutes);
router.use("/category", categoryRoutes);
router.use(
  "/project",
  verifyAccessToken,
  isVerifiedUser,
  // authorize(ROLES.ADMIN, ROLES.OWNER),
  projectRoutes
);
router.use("/proposal", verifyAccessToken, isVerifiedUser, proposalRoutes);
router.use(
  "/admin",
  verifyAccessToken,
  isVerifiedUser,
  authorize(ROLES.ADMIN),
  adminRoutes
);

export { router as allRoutes };

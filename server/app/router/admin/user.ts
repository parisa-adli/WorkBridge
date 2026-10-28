import { Router } from "express";
import { UserController } from "../../http/controllers/admin/user.controller";
import { validate } from "../../http/middlewares/validate";
import { userIdParamSchema } from "../../http/validators/common.schema";
import { userListQuerySchema, verifyUserSchema } from "../../http/validators/user.schema";

const router = Router();

router.get("/list", validate(userListQuerySchema, "query"), UserController.getAllUsers);
router.patch(
  "/verify/:userId",
  validate(userIdParamSchema, "params"),
  validate(verifyUserSchema),
  UserController.verifyUser
);
router.get("/profile/:userId", validate(userIdParamSchema, "params"), UserController.userProfile);

export { router as userAdminRoutes };

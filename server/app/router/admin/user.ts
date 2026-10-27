import { Router } from "express";
import { UserController } from "../../http/controllers/admin/user.controller";

const router = Router();

router.get("/list", UserController.getAllUsers);
router.patch("/verify/:userId", UserController.verifyUser);
router.get("/profile/:userId", UserController.userProfile);

export { router as userAdminRoutes };

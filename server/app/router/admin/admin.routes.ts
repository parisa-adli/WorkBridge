import { Router } from "express";
import { categoryAdminRoutes } from "./category";
import { userAdminRoutes } from "./user";

const router = Router();

router.use("/category", categoryAdminRoutes);
router.use("/user", userAdminRoutes);

export { router as adminRoutes };

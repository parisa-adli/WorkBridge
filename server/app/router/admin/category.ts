import { Router } from "express";
import { CategoryController } from "../../http/controllers/category.controller";

const router = Router();

router.post("/add", CategoryController.addNewCategory);
router.patch("/update/:id", CategoryController.updateCategory);
router.delete("/remove/:id", CategoryController.removeCategory);

export { router as categoryAdminRoutes };

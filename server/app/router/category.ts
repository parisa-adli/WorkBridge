import { Router } from "express";
import { CategoryController } from "../http/controllers/category.controller";

const router = Router();

router.get("/list", CategoryController.getListOfCategories);

router.get("/:id", CategoryController.getCategoryById);

export { router as categoryRoutes };

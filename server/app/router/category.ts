import { Router } from "express";
import { CategoryController } from "../http/controllers/category.controller";
import { validate } from "../http/middlewares/validate";
import { idParamSchema } from "../http/validators/common.schema";
import { categoryListQuerySchema } from "../http/validators/category.schema";

const router = Router();

router.get("/list", validate(categoryListQuerySchema, "query"), CategoryController.getListOfCategories);

router.get("/:id", validate(idParamSchema, "params"), CategoryController.getCategoryById);

export { router as categoryRoutes };

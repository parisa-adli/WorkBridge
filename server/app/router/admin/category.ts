import { Router } from "express";
import { CategoryController } from "../../http/controllers/category.controller";
import { validate } from "../../http/middlewares/validate";
import { idParamSchema } from "../../http/validators/common.schema";
import { addCategorySchema, updateCategorySchema } from "../../http/validators/category.schema";

const router = Router();

router.post("/add", validate(addCategorySchema), CategoryController.addNewCategory);
router.patch(
  "/update/:id",
  validate(idParamSchema, "params"),
  validate(updateCategorySchema),
  CategoryController.updateCategory
);
router.delete("/remove/:id", validate(idParamSchema, "params"), CategoryController.removeCategory);

export { router as categoryAdminRoutes };

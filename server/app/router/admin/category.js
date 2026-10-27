const router = require("express").Router();
const {
  CategoryController,
} = require("../../http/controllers/category.controller");

router.post("/add", CategoryController.addNewCategory);
router.patch("/update/:id", CategoryController.updateCategory);
router.delete("/remove/:id", CategoryController.removeCategory);

module.exports = {
  categoryAdminRoutes: router,
};

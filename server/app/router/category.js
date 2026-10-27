const {
  CategoryController,
} = require("../http/controllers/category.controller");

const router = require("express").Router();

router.get("/list", CategoryController.getListOfCategories);

router.get("/:id", CategoryController.getCategoryById);
module.exports = {
  categoryRoutes: router,
};

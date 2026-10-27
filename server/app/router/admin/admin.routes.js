const { categoryAdminRoutes } = require("./category");
const { userAdminRoutes } = require("./user");

const router = require("express").Router();

router.use("/category", categoryAdminRoutes);
router.use("/user", userAdminRoutes);

module.exports = {
  adminRoutes: router,
};

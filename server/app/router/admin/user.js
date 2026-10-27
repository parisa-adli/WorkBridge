const {
  UserController,
} = require("../../http/controllers/admin/user.controller");

const router = require("express").Router();

router.get("/list", UserController.getAllUsers);
router.patch("/verify/:userId", UserController.verifyUser);
router.get("/profile/:userId", UserController.userProfile);

module.exports = {
  userAdminRoutes: router,
};

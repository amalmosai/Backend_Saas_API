import express from "express";
import UserController from "../controller/user.controller";
import { authenticateUser, authorizePermission } from "../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermission("مستخدم", "create"),
    UserController.createUser
  );

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermission("مستخدم", "view"),
    UserController.getAllUsers
  );

router.route("/:id").get(authenticateUser, UserController.getUser);

router
  .route("/:id")
  .delete(
    authenticateUser,
    authorizePermission("مستخدم", "delete"),
    UserController.deleteUser
  );

router.route("/:id").patch(authenticateUser, UserController.updateUser);

router
  .route("/authUser")
  .post(authenticateUser, UserController.getUserAuthuser);

router.route("/roles").get(authenticateUser, UserController.getAllRoles);

router.route("/delete/role").delete(UserController.deleteRoleFromAllUsers);

router
  .route("/:id/permissions")
  .patch(authenticateUser, UserController.updatePermissions);

router.route("/all/stats").get(authenticateUser, UserController.getUsersStats);

export default router;

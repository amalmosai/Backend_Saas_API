import express from "express";
import UserController from "../controller/user.controller";
import { authenticateUser, authorizePermission } from "../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermission("user", "create"),
    UserController.createUser
  );

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermission("user", "view"),
    UserController.getAllUsers
  );

router.route("/roles").get(authenticateUser, UserController.getAllRoles);

router.route("/:id").get(authenticateUser, UserController.getUser);

router
  .route("/:id")
  .delete(
    authenticateUser,
    authorizePermission("user", "delete"),
    UserController.deleteUser
  );

router
  .route("/:id/role")
  .delete(authenticateUser, UserController.deleteRoleFromUser);

router.route("/:id").patch(authenticateUser, UserController.updateUser);

router
  .route("/authUser")
  .post(authenticateUser, UserController.getUserAuthuser);

router
  .route("/:id/permissions")
  .patch(authenticateUser, UserController.updatePermissions);

export default router;

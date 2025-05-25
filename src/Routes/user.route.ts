import express from "express";
import UserController from "../controller/user.controller";
import { upload } from "../middlewares/uploadImage";
import { authenticateUser, authorizePermission } from "../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermission("user", "create"),
    upload.single("image"),
    UserController.createUser
  );

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermission("user", "view"),
    UserController.getAllUsers
  );

router.route("/:id").get(authenticateUser, UserController.getUser);

router
  .route("/:id")
  .delete(
    authenticateUser,
    authorizePermission("user", "delete"),
    UserController.deleteUser
  );

router
  .route("/:id")
  .put(authenticateUser, upload.single("image"), UserController.updateUser);

export default router;

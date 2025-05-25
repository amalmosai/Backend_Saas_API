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

export default router;

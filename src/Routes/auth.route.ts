import express from "express";
import AuthController from "../controller/auth.controller";
import { upload } from "../middlewares/uploadImage";
const router = express.Router();

router.route("/register").post(upload.single("image"), AuthController.register);

router.route("/login").post(AuthController.login);

// router.route("/forgot-password").post(AuthController.forgotPassword);

// router.route("/reset-password").post(AuthController.resetPassword);

export default router;

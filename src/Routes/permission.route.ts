import express from "express";
import {
  authenticateUser,
  authorizePermissionFromBody,
} from "../middlewares/auth";
import PermissionsController from "../controller/permission.controller";
const router = express.Router();

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermissionFromBody(),
    PermissionsController.checkPermission
  );

export default router;

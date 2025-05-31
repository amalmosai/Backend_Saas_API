import express from "express";
import AdvertisementController from "../controller/advertisement.controller";
import { authenticateUser, authorizePermission } from "../middlewares/auth";
import { upload } from "../middlewares/uploadImage";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermission("advertisement", "create"),
    upload.single("image"),
    AdvertisementController.createAdvertisement
  );

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermission("advertisement", "view"),
    AdvertisementController.getAllAdvertisements
  );

router
  .route("/")
  .delete(
    authenticateUser,
    authorizePermission("advertisement", "delete"),
    AdvertisementController.deleteAllAdvertisements
  );

router
  .route("/:id")
  .get(authenticateUser, AdvertisementController.getAdvertisementById);

router
  .route("/:id")
  .delete(
    authenticateUser,
    authorizePermission("advertisement", "delete"),
    AdvertisementController.deleteAdvertisementById
  );

router
  .route("/:id")
  .patch(
    authenticateUser,
    authorizePermission("advertisement", "update"),
    upload.single("image"),
    AdvertisementController.updateAdvertisementById
  );

export default router;

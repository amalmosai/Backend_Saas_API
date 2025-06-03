import express from "express";
import AlbumController from "../controller/album.controller";
import { authenticateUser, authorizePermission } from "../middlewares/auth";
import { upload } from "../middlewares/uploadImage";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermission("album", "create"),
    AlbumController.createAlbum
  );

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermission("album", "view"),
    AlbumController.getAlbums
  );

router.route("/:id").get(authenticateUser, AlbumController.getAlbumById);

router
  .route("/:id")
  .delete(
    authenticateUser,
    authorizePermission("album", "delete"),
    AlbumController.deleteAlbum
  );

router.route("/:id").put(
  authenticateUser,
  // authorizePermission("album", "update"),
  upload.single("image"),
  AlbumController.uploadImageAndAddToAlbum
);

router
  .route("/:id")
  .patch(
    authenticateUser,
    authorizePermission("album", "update"),
    AlbumController.updateAlbumById
  );

router
  .route("/:id/images/:imageId")
  .delete(
    authenticateUser,
    authorizePermission("album", "update"),
    AlbumController.deleteImageFromAlbum
  );
export default router;

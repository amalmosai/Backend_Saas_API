import express from "express";
import NotificationController from "../controller/notification.controller";
import { authenticateUser, authorizePermission } from "../middlewares/auth";

const router = express.Router();
router
  .route("/read-all")
  .patch(authenticateUser, NotificationController.markAllAsRead);

router
  .route("/unread-count")
  .get(authenticateUser, NotificationController.getUnreadCount);

router
  .route("/")
  .get(authenticateUser, NotificationController.getNotifications);

router
  .route("/:id/read")
  .patch(authenticateUser, NotificationController.markAsRead);

router
  .route("/:id")
  .delete(authenticateUser, NotificationController.deleteNotification);

export default router;

import express from "express";
import EventController from "../controller/event.controller";
import { authenticateUser, authorizePermission } from "../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermission("event", "create"),
    EventController.createEvent
  );

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermission("event", "view"),
    EventController.getAllEvents
  );

router.route("/:id").get(authenticateUser, EventController.getEventById);

router
  .route("/:id")
  .delete(
    authenticateUser,
    authorizePermission("event", "delete"),
    EventController.deleteEventById
  );

router
  .route("/:id")
  .patch(
    authenticateUser,
    authorizePermission("event", "update"),
    EventController.updateEventById
  );

export default router;

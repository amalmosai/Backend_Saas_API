import { Request, Response, NextFunction } from "express";
import Event from "../models/event.model";
import asyncWrapper from "../middlewares/asynHandler";
import { createCustomError, HttpCode } from "../errors/customError";
import mongoose from "mongoose";

class EventController {
  createEvent = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { address, description, location, startDate, endDate } = req.body;

      const userId = req.user?.id;

      if (!userId) {
        return next(createCustomError("Unauthorized", HttpCode.UNAUTHORIZED));
      }

      if (!address || !description || !location || !startDate || !endDate) {
        return next(
          createCustomError("Missing required fields", HttpCode.BAD_REQUEST)
        );
      }

      if (new Date(startDate) >= new Date(endDate)) {
        return next(
          createCustomError(
            "End date must be after start date",
            HttpCode.BAD_REQUEST
          )
        );
      }

      const event = await Event.create({
        userId,
        address,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });

      res.status(HttpCode.CREATED).json({
        success: true,
        data: event,
        message: "Event created successfully",
      });
    }
  );

  getAllEvents = asyncWrapper(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalEvents = await Event.countDocuments();
    const events = await Event.find()
      .populate("userId", "-password")
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalEvents / limit);

    res.status(HttpCode.OK).json({
      success: true,
      pagination: {
        totalEvents,
        totalPages,
        currentPage: page,
        pageSize: events.length,
      },
      data: events,
      message: "Fetched all events successfully",
    });
  });

  getEventById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const eventId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return next(
          createCustomError("Invalid event ID", HttpCode.BAD_REQUEST)
        );
      }

      const event = await Event.findById(eventId).populate(
        "userId",
        "-password"
      );

      if (!event) {
        return next(createCustomError("Event not found", HttpCode.NOT_FOUND));
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: event,
        message: "Fetched event successfully",
      });
    }
  );

  deleteEventById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const eventId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return next(
          createCustomError("Invalid event ID", HttpCode.BAD_REQUEST)
        );
      }

      const event = await Event.findById(eventId);

      if (!event) {
        return next(createCustomError("Event not found", HttpCode.NOT_FOUND));
      }

      await event.deleteOne();

      res.status(HttpCode.OK).json({
        success: true,
        data: null,
        message: "Event deleted successfully",
      });
    }
  );

  updateEventById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const eventId = req.params.id;
      let updateData = req.body;

      if (updateData.startDate && updateData.endDate) {
        if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
          return next(
            createCustomError(
              "End date must be after start date",
              HttpCode.BAD_REQUEST
            )
          );
        }
      } else if (updateData.startDate || updateData.endDate) {
        const existingEvent = await Event.findById(eventId);
        if (existingEvent) {
          const startDate = updateData.startDate
            ? new Date(updateData.startDate)
            : existingEvent.startDate;
          const endDate = updateData.endDate
            ? new Date(updateData.endDate)
            : existingEvent.endDate;

          if (startDate >= endDate) {
            return next(
              createCustomError(
                "End date must be after start date",
                HttpCode.BAD_REQUEST
              )
            );
          }
        }
      }

      const cleanObject = (obj: any) => {
        return Object.fromEntries(
          Object.entries(obj).filter(
            ([_, value]) =>
              value !== null && value !== undefined && value !== ""
          )
        );
      };
      updateData = cleanObject(updateData);

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return next(
          createCustomError("Invalid event ID", HttpCode.BAD_REQUEST)
        );
      }

      const event = await Event.findById(eventId);

      if (!event) {
        return next(createCustomError("Event not found", HttpCode.NOT_FOUND));
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        { _id: eventId },
        updateData,
        { new: true }
      );

      res.status(HttpCode.OK).json({
        success: true,
        data: updatedEvent,
        message: "Event updated successfully",
      });
    }
  );
}

export default new EventController();

import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asynHandler";
import { HttpCode, createCustomError } from "../errors/customError";
import Notification from "../models/notification.model";
import User from "../models/user.model";
import mongoose from "mongoose";

class NotificationController {
  getNotifications = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        Notification.find({ recipientId: req.user.id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("sender.id", "email")
          .lean(),
        Notification.countDocuments({ recipientId: req.user._id }),
      ]);

      res.status(HttpCode.OK).json({
        success: true,
        data: notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: "Get all notifications successfuly",
      });
    }
  );

  markAsRead = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipientId: req.user.id },
        { read: true, readAt: new Date(), status: "delivered" },
        { new: true }
      );

      if (!notification) {
        return next(
          createCustomError("Notification not found", HttpCode.NOT_FOUND)
        );
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: notification,
        message: "make notification mark as read",
      });
    }
  );

  markAllAsRead = asyncWrapper(async (req: Request, res: Response) => {
    await Notification.updateMany(
      { recipientId: req.user.id, read: false },
      { read: true, readAt: new Date(), status: "delivered" }
    );

    res.status(HttpCode.OK).json({
      success: true,
      message: "تم تعليم جميع الإشعارات كمقروءة",
      data: null,
    });
  });

  getUnreadCount = asyncWrapper(async (req: Request, res: Response) => {
    const count = await Notification.countDocuments({
      recipientId: req.user.id,
      read: false,
    });

    res.status(HttpCode.OK).json({
      success: true,
      data: { count },
      message: "get the count of unread notification",
    });
  });

  deleteNotification = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipientId: req.user.id,
      });

      if (!notification) {
        return next(
          createCustomError("Notification not found", HttpCode.NOT_FOUND)
        );
      }

      res.status(HttpCode.OK).json({
        success: true,
        message: "تم حذف الإشعار بنجاح",
        data: null,
      });
    }
  );
}

export default new NotificationController();

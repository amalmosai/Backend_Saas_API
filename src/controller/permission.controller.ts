import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asynHandler";
import { createCustomError, HttpCode } from "../errors/customError";
import Permission from "../models/permission.model";

class PermissionsController {
  checkPermission = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      res.status(HttpCode.CREATED).json({
        success: true,
        data: null,
        message: "you have permission for this action",
      });
    }
  );

  createPermission = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { role, permissions } = req.body;

      if (!role) {
        return next(
          createCustomError("Role is required", HttpCode.BAD_REQUEST)
        );
      }

      const existingPermission = await Permission.findOne({ role });
      if (existingPermission) {
        return next(
          createCustomError(
            "Permission for this role already exists",
            HttpCode.CONFLICT
          )
        );
      }

      const permission = await Permission.create({
        role,
        permissions,
      });

      res.status(HttpCode.CREATED).json({
        success: true,
        data: permission,
        message: "Permission created successfully",
      });
    }
  );

  getAllPermissions = asyncWrapper(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalPermissions = await Permission.countDocuments();
    const permissions = await Permission.find().skip(skip).limit(limit);

    res.status(HttpCode.OK).json({
      success: true,
      pagination: {
        totalPermissions,
        totalPages: Math.ceil(totalPermissions / limit),
        currentPage: page,
        pageSize: permissions.length,
      },
      data: permissions,
      message: "Permissions retrieved successfully",
    });
  });

  deletePermission = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { role } = req.params;

      const deletedPermission = await Permission.findOneAndDelete({ role });
      if (!deletedPermission) {
        return next(
          createCustomError("Permission not found", HttpCode.NOT_FOUND)
        );
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: null,
        message: "Permission deleted successfully",
      });
    }
  );

  getAllRoles = asyncWrapper(async (req: Request, res: Response) => {
    const roles = await Permission.distinct("role");
    res.status(HttpCode.OK).json({
      success: true,
      data: roles,
      message: "Roles retrieved successfully",
    });
  });
}

export default new PermissionsController();

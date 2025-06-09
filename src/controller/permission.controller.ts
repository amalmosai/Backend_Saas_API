import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asynHandler";
import { createCustomError, HttpCode } from "../errors/customError";
import Permission from "../models/permission.model";
import User from "../models/user.model";

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

  updatePermissionForRole = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { role } = req.params;
      const { entity, action, value } = req.body;

      const allowedEntities = [
        "مناسبه",
        "عضو",
        "مستخدم",
        "معرض الصور",
        "ماليه",
        "اعلان",
      ];

      const allowedActions = ["view", "create", "update", "delete"];

      if (!allowedEntities.includes(entity)) {
        return next(createCustomError("Invalid entity", HttpCode.BAD_REQUEST));
      }

      if (!allowedActions.includes(action)) {
        return next(createCustomError("Invalid action", HttpCode.BAD_REQUEST));
      }

      if (typeof value !== "boolean") {
        return next(
          createCustomError("Value must be a boolean", HttpCode.BAD_REQUEST)
        );
      }

      const permission = await Permission.findOne({ role });
      if (!permission) {
        return next(
          createCustomError("Permission not found", HttpCode.NOT_FOUND)
        );
      }

      const entityPermission: any = permission.permissions.find(
        (perm: any) => perm.entity === entity
      );

      if (entityPermission) {
        entityPermission[action] = value;
      } else {
        permission.permissions.push({ entity, [action]: value });
      }

      await permission.save();

      const usersWithRole = await User.find({ role });
      for (const user of usersWithRole) {
        const userEntityPermission = user.permissions.find(
          (perm: any) => perm.entity === entity
        );
        if (userEntityPermission) {
          userEntityPermission[action] = value;
        } else {
          user.permissions.push({ entity, [action]: value });
        }
        await user.save();
      }

      res.status(HttpCode.OK).json({
        success: true,
        message: `Permission '${action}' for '${entity}' updated successfully`,
        data: permission.permissions,
      });
    }
  );
}

export default new PermissionsController();

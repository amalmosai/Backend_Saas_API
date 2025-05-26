import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asynHandler";
import User from "../models/user.model";
import { HttpCode, createCustomError } from "../errors/customError";
import { hashPassword } from "../utils/passwordUtils";
import Tenant from "../models/tenant.model";
import {
  defaultPermissions,
  superAdminPermissions,
} from "../models/permission.model";

class UserController {
  createUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        fname,
        lname,
        email,
        password,
        phone,
        familyBranch,
        familyRelationship,
        image,
        role,
      } = req.body;

      const emailExists = await User.findOne({ email });

      if (emailExists) {
        return next(
          createCustomError("Email already exists", HttpCode.BAD_REQUEST)
        );
      }

      let permission;
      let status;
      if (role === "super_admin") {
        permission = superAdminPermissions;
        status = "accept";
      } else {
        permission = defaultPermissions;
        status = "pending";
      }

      const familyName = "Elsaqar";

      let tenant = await Tenant.findOne({ familyName });
      if (!tenant) {
        tenant = new Tenant({
          familyName,
          slug: familyName.toLowerCase().replace(/\s+/g, "-"),
        });
        await tenant.save();
      }

      const hashedPwd = await hashPassword(password);

      const user = await User.create({
        tenantId: tenant._id,
        fname,
        lname,
        email,
        password: hashedPwd,
        phone,
        familyBranch,
        familyRelationship,
        image,
        permissions: permission,
        role,
        status,
      });

      res.status(HttpCode.CREATED).json({
        success: true,
        data: user,
        message: "user created sucessfully",
      });
    }
  );

  getAllUsers = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const familyName = "Elsaqar";

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      let tenant = await Tenant.findOne({ familyName });
      const totalUsers = await User.countDocuments({ tenantId: tenant?._id });

      const users = await User.find({ tenantId: tenant?._id })
        .select("-password")
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalUsers / limit);

      res.status(HttpCode.OK).json({
        success: true,
        data: users,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          pageSize: users.length,
        },
        message: "users get sucessfully",
      });
    }
  );

  getUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const user = await User.findById(id).select("-password");

      if (!user) {
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: user,
        message: "user get sucessfully",
      });
    }
  );

  getUserAuthuser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = req.body.authUser?.id;

      const user = await User.findById(id).select("-password");

      if (!user) {
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: user,
        message: "Auth user get sucessfully",
      });
    }
  );

  deleteUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser)
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));

      res.status(HttpCode.OK).json({
        success: true,
        data: null,
        message: "User deleted successfully.",
      });
    }
  );

  updateUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) {
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: updatedUser,
        message: "user updated sucessfully",
      });
    }
  );
}

export default new UserController();

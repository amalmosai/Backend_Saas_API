import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asynHandler";
import User from "../models/user.model";
import { HttpCode, createCustomError } from "../errors/customError";
import { hashPassword } from "../utils/password";
import Tenant from "../models/tenant.model";
import {
  defaultPermissions,
  familyOlders,
  financialManager,
  socialManager,
  superAdminPermissions,
} from "../models/permission.model";
import { sendAccountStatusEmail } from "../services/email.service";
import Member from "../models/member.model";

const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/dnuxudh3t/image/upload/v1748100017/avatar_i30lci.jpg";

class UserController {
  createUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const familyName = "Elsaqar";

      let tenant = await Tenant.findOne({ familyName });
      if (!tenant) {
        tenant = new Tenant({
          familyName,
          slug: familyName.toLowerCase().replace(/\s+/g, "-"),
        });
        await tenant.save();
      }

      let {
        email,
        password,
        phone,
        familyBranch,
        familyRelationship,
        role,
        status,
        address,
      } = req.body;

      const emailExists = await User.findOne({ email });

      if (emailExists) {
        return next(
          createCustomError("Email already exists", HttpCode.BAD_REQUEST)
        );
      }

      if (familyRelationship === "زوج") {
        const existingHusband = await User.findOne({
          familyBranch,
          familyRelationship: "زوج",
          status: "مقبول",
        });

        if (existingHusband) {
          return next(
            createCustomError(
              `Branch ${familyBranch} already has an approved husband`,
              HttpCode.CONFLICT
            )
          );
        }
      }

      let permission;
      switch (role) {
        case "مدير النظام":
          permission = superAdminPermissions;
          status = "مقبول";
          break;
        case "مدير اللجنه الاجتماعية":
          permission = socialManager;
          status = "مقبول";
          break;
        case "مدير اللجنه الماليه":
          permission = financialManager;
          status = "مقبول";
          break;
        case "كبار الاسرة":
          permission = familyOlders;
          status = "مقبول";
          break;
        default:
          permission = defaultPermissions;
          status = status ? status : "قيد الانتظار";
      }

      const hashedPwd = await hashPassword(password);

      const user = new User({
        tenantId: tenant._id,
        email,
        password: hashedPwd,
        phone,
        familyBranch,
        familyRelationship,
        permissions: permission,
        status,
        address,
      });

      if (Array.isArray(role)) {
        for (const r of role) user.addRole(r);
      } else if (typeof role === "string") {
        user.addRole(role);
      }
      await user.save();

      const femaleRelationships = new Set(["زوجة", "ابنة"]);
      const gender = femaleRelationships.has(familyRelationship)
        ? "أنثى"
        : "ذكر";

      const newMember = new Member({
        userId: user._id,
        fname: email.split("@")[0],
        lname: "الدهمش",
        gender,
        familyBranch,
        familyRelationship,
        isUser: true,
        image: DEFAULT_IMAGE_URL,
      });

      await newMember.save();

      user.memberId = newMember._id;
      await user.save();

      res.status(HttpCode.CREATED).json({
        success: true,
        data: {
          user,
          member: newMember,
        },
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
      const id = req.user?.id;

      const user = await User.findById(id)
        .select("-password")
        .populate("memberId");

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

      const userToDelete = await User.findById(id);
      if (!userToDelete) {
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));
      }

      const isSuperAdmin = userToDelete?.role?.includes("مدير النظام");

      if (isSuperAdmin) {
        return next(
          createCustomError(
            "Super Admin accounts cannot be deleted.",
            HttpCode.FORBIDDEN
          )
        );
      }

      await userToDelete.deleteOne();

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

      const loggedInUserId = req.user?.id;

      let updateData = req.body;

      const originalUser = await User.findById(id);

      if (!originalUser) {
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));
      }

      if (
        Array.isArray(originalUser?.role) &&
        originalUser.role.includes("مدير النظام") &&
        loggedInUserId !== originalUser?._id.toString()
      ) {
        return next(
          createCustomError(
            "You are not allowed to update this account",
            HttpCode.FORBIDDEN
          )
        );
      }

      if (req.body.role) {
        const { role } = req.body;
        const currentRoles = originalUser.role || [];
        if (Array.isArray(role)) {
          updateData.role = [...new Set([...currentRoles, ...role])];
        } else if (typeof role === "string") {
          updateData.role = [...new Set([...currentRoles, role])];
        }
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (updatedUser?.status !== originalUser.status) {
        if (
          updatedUser?.status === "accept" ||
          updatedUser?.status === "reject"
        ) {
          sendAccountStatusEmail(updatedUser);
        }
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: updatedUser,
        message: "user updated sucessfully",
      });
    }
  );

  updatePermissions = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
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

      const user = await User.findById(id);
      if (!user) throw createCustomError("User not found", HttpCode.NOT_FOUND);

      const permission = user.permissions.find(
        (perm: any) => perm.entity === entity
      );

      if (permission) {
        permission[action] = value;
      }

      await user.save();

      res.status(HttpCode.OK).json({
        success: true,
        message: `Permission '${action}' for '${entity}' updated successfully`,
        data: user.permissions,
      });
    }
  );

  getAllRoles = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const users = await User.find({}, "role");

      const roleSet = new Set<string>();

      for (const user of users) {
        if (Array.isArray(user.role)) {
          user.role.forEach((role) => roleSet.add(role));
        }
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: [...roleSet],
        message: "All unique roles retrieved successfully",
      });
    }
  );

  deleteRoleFromUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || typeof role !== "string") {
        return next(
          createCustomError(
            "Role name is required and must be a string",
            HttpCode.BAD_REQUEST
          )
        );
      }

      if (role === "مدير النظام") {
        return next(
          createCustomError(
            "Cannot remove super admin role from the system",
            HttpCode.FORBIDDEN
          )
        );
      }

      const user = await User.findById(id);

      if (!user) {
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));
      }

      if (!user.role || !user.role.includes(role)) {
        return next(
          createCustomError(
            `User does not have the role '${role}'`,
            HttpCode.BAD_REQUEST
          )
        );
      }

      user.role = user.role.filter((r: string) => r !== role);
      await user.save();

      res.status(HttpCode.OK).json({
        success: true,
        data: user,
        message: `Role '${role}' removed successfully from user`,
      });
    }
  );
}

export default new UserController();

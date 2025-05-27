import { Request, Response, NextFunction } from "express";
import Jwt, { Secret } from "jsonwebtoken";
import User from "../models/user.model";
const { createCustomError, HttpCode } = require("../errors/customError");

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.cookie;

  if (!authHeader || !authHeader.startsWith("accessToken=")) {
    return next(createCustomError(`No token provided`, HttpCode.UNAUTHORIZED));
  }

  const token = authHeader.split("=")[1];
  if (!token) {
    return next(
      createCustomError(`Authorization token not found"`, HttpCode.UNAUTHORIZED)
    );
  }

  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET as Secret);
    req.body.authUser = decoded;
    next();
  } catch (error) {
    return next(
      createCustomError(
        `Not authorized to access this route`,
        HttpCode.UNAUTHORIZED
      )
    );
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.body.authUser.role)) {
      console.log(req.body.authUser.role);
      console.log(roles);
      return next(
        createCustomError(
          `Unauthorized to access this route`,
          HttpCode.UNAUTHORIZED
        )
      );
    }
    next();
  };
};

export const authorizePermission = (
  entity: string,
  action: "view" | "update" | "create" | "delete"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.authUser.id;

    if (!userId) {
      return next(createCustomError("Unauthorized", HttpCode.UNAUTHORIZED));
    }

    const user = await User.findById({ _id: userId });

    if (!user) {
      return next(createCustomError("User not found", HttpCode.NOT_FOUND));
    }

    const permission = user.permissions.find((p: any) => p.entity === entity);

    if (!permission || !permission[action]) {
      return next(
        createCustomError(
          `You do not have permission to ${action} ${entity}`,
          HttpCode.FORBIDDEN
        )
      );
    }
    console.log("user have permission");
    next();
  };
};

export const authorizePermissionFromBody = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.authUser?.id;

    if (!userId) {
      return next(createCustomError("Unauthorized", HttpCode.UNAUTHORIZED));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(createCustomError("User  not found", HttpCode.NOT_FOUND));
    }

    const { entity, action } = req.body;

    if (!entity || !action) {
      return next(
        createCustomError(
          "Entity and action are required",
          HttpCode.BAD_REQUEST
        )
      );
    }

    const permission = user.permissions.find((p: any) => p.entity === entity);

    if (!permission || !permission[action]) {
      return next(
        createCustomError(
          `You do not have permission to ${action} ${entity}`,
          HttpCode.FORBIDDEN
        )
      );
    }

    console.log("User has permission");
    next();
  };
};

import { Request, Response, NextFunction } from "express";
import Jwt, { Secret } from "jsonwebtoken";
const { createCustomError, HttpCode } = require("../errors/customError");

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createCustomError(`No token provided`, HttpCode.UNAUTHORIZED));
  }

  const token = authHeader.split(" ")[1];
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

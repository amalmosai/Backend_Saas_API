import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asynHandler";
import { HttpCode } from "../errors/customError";

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
}

export default new PermissionsController();

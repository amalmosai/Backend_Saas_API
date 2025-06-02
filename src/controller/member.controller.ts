import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asynHandler";
import Member from "../models/member.model";
import { HttpCode, createCustomError } from "../errors/customError";

class MemberController {
  createMember = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { fullName, gender } = req.body;

      if (!fullName || !gender) {
        return next(
          createCustomError(
            "Full name and gender are required",
            HttpCode.BAD_REQUEST
          )
        );
      }
      const member = await Member.create(req.body);
      await member.save();
      res.status(HttpCode.CREATED).json({
        success: true,
        message: "Member created successfully",
        data: member,
      });
    }
  );

  updateMember = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const updatedMember = await Member.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      }).populate("userId");

      if (!updatedMember) {
        return next(createCustomError("Member not found", HttpCode.NOT_FOUND));
      }
      res.status(HttpCode.OK).json({
        success: true,
        data: updatedMember,
        message: "Member updated successfully",
      });
    }
  );

  getAllMembers = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const totalMembers = await Member.countDocuments();

      const members = await Member.find()
        .populate("userId")
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalMembers / limit);

      res.status(HttpCode.OK).json({
        success: true,
        data: members,
        pagination: {
          totalMembers,
          totalPages,
          currentPage: page,
          pageSize: members.length,
        },
        message: "Members retrieved successfully",
      });
    }
  );

  getMemberById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const member = await Member.findById(id).populate("userId");
      if (!member) {
        return next(createCustomError("Member not found", HttpCode.NOT_FOUND));
      }
      res.status(HttpCode.OK).json({
        success: true,
        data: member,
        message: "Member retrieved successfully",
      });
    }
  );

  deleteMember = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const deletedMember = await Member.findByIdAndDelete(id);
      if (!deletedMember) {
        return next(createCustomError("Member not found", HttpCode.NOT_FOUND));
      }
      res.status(HttpCode.OK).json({
        success: true,
        message: "Member deleted successfully",
        data: null,
      });
    }
  );
}

export default new MemberController();

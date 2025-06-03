import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asynHandler";
import Member from "../models/member.model";
import { HttpCode, createCustomError } from "../errors/customError";

const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/dnuxudh3t/image/upload/v1748100017/avatar_i30lci.jpg";

class MemberController {
  createMember = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        fname,
        lname,
        familyBranch,
        familyRelationship,
        gender,
        husband,
        wives,
      } = req.body;

      if (req.file?.path) {
        req.body.image = req.file.path.replace(/\\/g, "/");
      } else {
        req.body.image = DEFAULT_IMAGE_URL;
      }

      if (!fname || !lname || !gender || !familyBranch || !familyRelationship) {
        return next(
          createCustomError(
            "First name, last name, gender, familyRelationship and family branch are required.",
            HttpCode.BAD_REQUEST
          )
        );
      }

      if (familyRelationship === "زوج") {
        const existingHead = await Member.findOne({
          familyBranch,
          familyRelationship: "زوج",
        });

        if (existingHead) {
          return next(
            createCustomError(
              `This family branch already has a male head (${existingHead.fname} ${existingHead.lname})`,
              HttpCode.BAD_REQUEST
            )
          );
        }

        if (gender !== "ذكر") {
          return next(
            createCustomError(
              "Family head (زوج) must be male",
              HttpCode.BAD_REQUEST
            )
          );
        }
      }

      if (wives && Array.isArray(wives) && wives.length > 0) {
        const wifeMembers = await Member.find({ _id: { $in: wives } });

        if (wifeMembers.length !== wives.length) {
          return next(
            createCustomError(
              "One or more wives not found",
              HttpCode.BAD_REQUEST
            )
          );
        }

        const nonFemales = wifeMembers.filter((w) => w.gender !== "أنثى");

        if (nonFemales.length > 0) {
          return next(
            createCustomError("All wives must be female", HttpCode.BAD_REQUEST)
          );
        }
      }

      if (familyRelationship === "زوجة" && husband) {
        const husbandMember = await Member.findById(husband);
        if (!husbandMember) {
          return next(
            createCustomError("Husband not found", HttpCode.BAD_REQUEST)
          );
        }
        if (husbandMember.gender !== "ذكر") {
          return next(
            createCustomError("Husband must be male", HttpCode.BAD_REQUEST)
          );
        }
        if (husbandMember.familyBranch !== familyBranch) {
          return next(
            createCustomError(
              "Husband must be from the same family branch",
              HttpCode.BAD_REQUEST
            )
          );
        }
      }

      const member = await Member.create(req.body);

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
      const {
        fname,
        lname,
        familyBranch,
        familyRelationship,
        gender,
        husband,
        wives,
      } = req.body;

      const member = await Member.findById(id);
      if (!member) {
        return next(createCustomError("Member not found", HttpCode.NOT_FOUND));
      }

      if (req.file?.path) {
        req.body.image = req.file.path.replace(/\\/g, "/");
      }

      if (familyRelationship === "زوج" && member.familyRelationship !== "زوج") {
        const existingHead = await Member.findOne({
          familyBranch,
          familyRelationship: "زوج",
          _id: { $ne: member._id },
        });
        if (existingHead) {
          return next(
            createCustomError(
              `This family branch already has a male head (${existingHead.fname} ${existingHead.lname})`,
              HttpCode.BAD_REQUEST
            )
          );
        }
      }

      if (husband) {
        const husbandMember = await Member.findById(husband);
        if (!husbandMember) {
          return next(
            createCustomError("Husband not found", HttpCode.BAD_REQUEST)
          );
        }
      }

      const updatedMember = await Member.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      })
        .populate("userId")
        .populate("husband")
        .populate("wives");

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

      const member = await Member.findById(id)
        .populate("userId")
        .populate("husband")
        .populate("wives");

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

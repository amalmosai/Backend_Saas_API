import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import asyncWrapper from "../middlewares/asynHandler";
import { createCustomError, HttpCode } from "../errors/customError";
import { generateToken } from "../utils/generateToken";
import { sendWelcomeEmail } from "../services/email.service";
import { clearCookie, setCookie } from "../utils/cookie";
import { comparePasswords, hashPassword } from "../utils/password";
import Tenant from "../models/tenant.model";
import Member from "../models/member.model";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/email.service";

const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/dnuxudh3t/image/upload/v1748100017/avatar_i30lci.jpg";

class AuthController {
  // Register a new user
  register = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password, phone, familyBranch, familyRelationship } =
        req.body;

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

      let image;
      if (req.file?.path) {
        image = req.file.path.replace(/\\/g, "/");
      } else {
        image = DEFAULT_IMAGE_URL;
      }
      console.log(image);

      const familyName = "Elsaqar";

      let tenant = await Tenant.findOne({ familyName });
      if (!tenant) {
        tenant = new Tenant({
          familyName,
          slug: familyName.toLowerCase().replace(/\s+/g, "-"),
        });
        await tenant.save();
      }

      const emailAlreadyExists = await User.findOne({ email });

      if (emailAlreadyExists) {
        return next(
          createCustomError("Email already Exists", HttpCode.BAD_REQUEST)
        );
      }
      const sanitizedPhone = phone.replace(/\D/g, "");
      const phoneNumber = sanitizedPhone ? Number(sanitizedPhone) : null;

      const hashedPassword = await hashPassword(password);

      const newUser = new User({
        tenantId: tenant._id,
        email,
        password: hashedPassword,
        phone: phoneNumber,
        familyBranch,
        familyRelationship,
      });

      await newUser.save();

      const femaleRelationships = new Set(["زوجة", "ابنة"]);
      const gender = femaleRelationships.has(familyRelationship)
        ? "أنثى"
        : "ذكر";

      const newMember = new Member({
        userId: newUser._id,
        fname: email.split("@")[0],
        lname: "الدهمش",
        gender,
        familyBranch,
        familyRelationship,
        isUser: true,
        image,
      });

      await newMember.save();
      sendWelcomeEmail(newUser);

      res.status(HttpCode.CREATED).json({
        sucess: true,
        data: { newUser, newMember },
        message: "User register sucessfully",
      });
    }
  );

  // User login
  login = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { identifier, password } = req.body;

      const authUser = await User.findOne({
        $or: [
          { email: identifier },
          { phone: isNaN(identifier) ? undefined : Number(identifier) },
        ],
      });

      if (!authUser) {
        return next(
          createCustomError(`Invalid Credentials email`, HttpCode.UNAUTHORIZED)
        );
      }

      // if (authUser.status !== "accept") {
      //   return next(
      //     createCustomError(
      //       "Account is still under review. Please wait for approval.",
      //       HttpCode.FORBIDDEN
      //     )
      //   );
      // }

      const isPasswordCorrect = await comparePasswords(
        password,
        authUser.password
      );

      if (!isPasswordCorrect) {
        return next(
          createCustomError(
            `Invalid Credentials password`,
            HttpCode.UNAUTHORIZED
          )
        );
      }

      const token = await generateToken({
        role: authUser.role,
        id: authUser._id,
      });

      setCookie(res, "accessToken", token);

      res.status(HttpCode.OK).json({
        sucess: true,
        data: authUser,
        message: "user sucessfully login",
      });
    }
  );

  // User logout
  logout = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      clearCookie(res, "accessToken");

      res.status(HttpCode.OK).json({
        success: true,
        message: "User successfully logged out",
        data: null,
      });
    }
  );

  forgotPassword = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await user.save();

      const resetUrl = `https://yourfrontend.com/reset-password/${resetToken}`;
      console.log(resetUrl);
      await sendPasswordResetEmail(user.email, resetUrl);

      res.status(HttpCode.OK).json({
        success: true,
        message: "Password reset link has been sent if the email exists.",
        data: user,
      });
    }
  );

  resetPassword = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { token } = req.params;
      const { newPassword } = req.body;

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return next(
          createCustomError(
            "Invalid or expired reset token",
            HttpCode.BAD_REQUEST
          )
        );
      }

      user.password = await hashPassword(newPassword);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.status(HttpCode.OK).json({
        success: true,
        message: "Password has been reset successfully.",
      });
    }
  );
}

export default new AuthController();

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

const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/dnuxudh3t/image/upload/v1748100017/avatar_i30lci.jpg";

class AuthController {
  // Register a new user
  register = asyncWrapper(
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
      } = req.body;

      let avatar;
      if (req.file?.path) {
        avatar = req.file.path.replace(/\\/g, "/");
      } else {
        avatar = DEFAULT_IMAGE_URL;
      }
      console.log(avatar);

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
        fname,
        lname,
        email,
        password: hashedPassword,
        phone: phoneNumber,
        familyBranch,
        familyRelationship,
        image: avatar,
      });

      const token = await generateToken({
        role: newUser.role,
        id: newUser._id,
      });
      await newUser.save();

      sendWelcomeEmail(newUser);

      res.status(HttpCode.CREATED).json({
        sucess: true,
        data: newUser,
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

      if (authUser.status !== "accept") {
        return next(
          createCustomError(
            "Account is still under review. Please wait for approval.",
            HttpCode.FORBIDDEN
          )
        );
      }

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
}

export default new AuthController();

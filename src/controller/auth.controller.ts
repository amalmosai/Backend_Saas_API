import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import asyncWrapper from "../middlewares/asynHandler";
import { createCustomError, HttpCode } from "../errors/customError";
import { generateToken } from "../utils/generateToken";
import { sendWelcomeEmail } from "../services/email.service";
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
      if (req.file?.filename) {
        avatar = req.file?.filename;
      } else {
        avatar = image;
      }
      console.log(avatar);
      const emailAlreadyExists = await User.findOne({ email });

      if (emailAlreadyExists) {
        return next(
          createCustomError("Email already Exists", HttpCode.BAD_REQUEST)
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        fname,
        lname,
        email,
        password: hashedPassword,
        phone: Number(phone),
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
      // sendVerificationEmail(newUser, token)
      // After await newUser.save();

      res.status(HttpCode.CREATED).json({
        sucess: true,
        data: newUser,
        message: "user sucessfully added",
        token: token,
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

      const isPasswordCorrect = await bcrypt.compare(
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

      const tokenUser = await generateToken({
        role: authUser.role,
        id: authUser._id,
      });

      res.status(HttpCode.OK).json({
        sucess: true,
        data: authUser,
        message: "user sucessfully login",
        token: tokenUser,
      });
    }
  );
}

export default new AuthController();

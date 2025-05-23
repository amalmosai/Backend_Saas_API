import { Schema, model, Types } from "mongoose";
import IUser from "../Interfaces/user.interface";

const userSchema = new Schema<IUser>(
  {
    tenantId: { type: String, required: true },
    fname: {
      type: String,
      required: [true, "first Name is required"],
    },
    lname: {
      type: String,
      required: [true, "last Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      validate: {
        validator: (value: string): boolean => {
          let pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
          return pattern.test(value);
        },
        message: "Please fill a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
    },
    phone: {
      type: Number,
      required: [true, "Please provide phone number"],
    },
    image: {
      type: String,
      default: "avatar.jfif",
    },
    role: {
      type: String,
      default: "user",
      enum: {
        values: ["super_admin", "admin", "moderator", "user"],
        message: "{VALUE} is not supported",
      },
    },
    familyBranch: {
      type: String,
      enum: {
        values: ["branch_1", "branch_2", "branch_3", "branch_4", "branch_5"],
        message: "{VALUE} is not supported",
      },
      required: [true, "Family Branch is required"],
    },
    familyRelationship: {
      type: String,
      enum: {
        values: ["son", "daughter", "wife", "husband", "grandchild", "other"],
        message: "{VALUE} is not supported",
      },
      required: [true, "Family Relationship is required"],
    },
  },
  { timestamps: true }
);

const User = model<IUser>("users", userSchema);

export default User;

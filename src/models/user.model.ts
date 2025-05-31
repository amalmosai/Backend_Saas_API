import { Schema, model, Types } from "mongoose";
import IUser from "../Interfaces/user.interface";
import { defaultPermissions, permissionSchema } from "./permission.model";

const userSchema = new Schema<IUser>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "tenant",
      required: true,
    },
    fname: {
      type: String,
    },
    lname: {
      type: String,
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
    status: {
      type: String,
      enum: {
        values: ["pending", "reject", "accept"],
        message: "{VALUE} is not supported",
      },
      default: "pending",
    },
    address: {
      type: String,
    },
    birthday: {
      type: Date,
    },
    personalProfile: {
      type: String,
    },
    permissions: {
      type: [permissionSchema],
      default: defaultPermissions,
    },
  },
  { timestamps: true, versionKey: false }
);

const User = model<IUser>("users", userSchema);

export default User;

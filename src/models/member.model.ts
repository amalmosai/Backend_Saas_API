import { Schema, model, Types } from "mongoose";
import IMember from "../Interfaces/member.interface";

const memberSchema = new Schema<IMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    fullName: {
      type: String,
      required: [true, "full Name is required"],
    },
    gender: {
      enum: {
        values: ["female", "male"],
        message: "{VALUE} is not supported",
      },
      required: [true, "gender is required"],
    },
    birthday: {
      type: Date,
    },
    deathDate: {
      type: Date,
    },
    summary: {
      type: String,
    },
    father: {
      type: String,
    },
    husbandOrWife: {
      type: String,
    },
  },
  { timestamps: true }
);

const Member = model<IMember>("members", memberSchema);

export default Member;

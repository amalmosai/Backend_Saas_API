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
      type: String,
      enum: ["female", "male"],
      required: [true, "Gender is required"],
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
  { timestamps: true, versionKey: false }
);

const Member = model<IMember>("members", memberSchema);

export default Member;

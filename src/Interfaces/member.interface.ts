import { Types } from "mongoose";

export default interface IMember {
  userId?: Types.ObjectId;
  fullName: string;
  gender: "female" | "male";
  birthday?: Date;
  deathDate?: Date;
  summary?: string;
  father?: string;
  husbandOrWife?: string;
}

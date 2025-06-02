import { Types } from "mongoose";

export default interface IMember {
  userId?: Types.ObjectId;
  fname: string;
  lname: string;
  gender: "أنثى" | "ذكر";
  familyBranch: string;
  birthday?: Date;
  deathDate?: Date;
  summary?: string;
  father?: Types.ObjectId;
  husband?: Types.ObjectId; //for female
  wives?: Types.ObjectId[]; //for male
  isUser?: boolean;
}

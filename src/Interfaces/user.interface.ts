import { Types } from "mongoose";

export default interface IUser {
  tenantId: Types.ObjectId;
  fname: string;
  lname: string;
  email: string;
  password: string;
  phone: number;
  image?: string;
  role?: string;
  familyBranch: string;
  familyRelationship: string;
  status?: string;
  address?: string;
  birthday?: Date;
  personalProfile?: string;
}

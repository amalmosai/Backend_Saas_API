import { Types } from "mongoose";

export default interface IUser {
  tenantId: string;
  fname: string;
  lname: string;
  email: string;
  password: string;
  phone?: number;
  image?: string;
  role?: string;
  familyBranch: string;
  familyRelationship: string;
}

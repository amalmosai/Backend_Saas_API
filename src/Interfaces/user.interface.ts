import { Types } from "mongoose";

export default interface IUser {
  tenantId: Types.ObjectId;
  fname: string;
  lname: string;
  email: string;
  password: string;
  phone: number;
  image?: string;
  role?: string[];
  familyBranch: string;
  familyRelationship: string;
  status?: string;
  address?: string;
  birthday?: Date;
  personalProfile?: string;
  permissions: any;
}

export interface IUserDocument extends IUser, Document {
  addRole(role: string): boolean;
  removeRole(role: string): boolean;
  hasRole(role: string): boolean;
  hasAnyRole(roles: string[]): boolean;
  getRoles(): string[];
}

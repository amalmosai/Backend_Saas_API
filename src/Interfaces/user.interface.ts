import { Types } from "mongoose";

export default interface IUser {
  tenantId: Types.ObjectId;
  memberId: Types.ObjectId;
  email: string;
  password: string;
  phone: number;
  role?: string[];
  familyBranch: string;
  familyRelationship: string;
  status?: string;
  address?: string;
  permissions: any;
}

export interface IUserDocument extends IUser, Document {
  addRole(role: string): boolean;
  removeRole(role: string): boolean;
  hasRole(role: string): boolean;
  hasAnyRole(roles: string[]): boolean;
  getRoles(): string[];
}

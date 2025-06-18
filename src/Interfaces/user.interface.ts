import { Types } from "mongoose";

export type FamilyRelationship =
  | "ابن"
  | "ابنة"
  | "زوجة"
  | "زوج"
  | "حفيد"
  | "أخرى";

export default interface IUser {
  tenantId: Types.ObjectId;
  memberId: Types.ObjectId;
  email: string;
  password: string;
  phone: number;
  role?: string[];
  familyBranch: string;
  familyRelationship: FamilyRelationship;
  status?: string;
  address?: string;
  permissions: any;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export interface IUserDocument extends IUser, Document {
  addRole(role: string): boolean;
  removeRole(role: string): boolean;
  hasRole(role: string): boolean;
  hasAnyRole(roles: string[]): boolean;
  getRoles(): string[];
}

import { Schema } from "mongoose";

export const actionPermissions = {
  view: { type: Boolean, default: false },
  update: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  create: { type: Boolean, default: false },
};

export const defaultPermissions = [
  { entity: "event", view: false, update: false, delete: false, create: false },
  {
    entity: "member",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
  {
    entity: "user",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
];
export const superAdminPermissions = [
  { entity: "event", view: true, update: true, delete: true, create: true },
  {
    entity: "member",
    view: true,
    update: true,
    delete: true,
    create: true,
  },
  {
    entity: "user",
    view: true,
    update: true,
    delete: true,
    create: true,
  },
];

export const permissionSchema = new Schema(
  {
    entity: { type: String, required: true }, // e.g. "event", "member"
    ...actionPermissions,
  },
  { _id: false }
);

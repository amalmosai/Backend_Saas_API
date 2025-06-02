import { Schema } from "mongoose";

export const actionPermissions = {
  view: { type: Boolean, default: false },
  update: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  create: { type: Boolean, default: false },
};

export const defaultPermissions = [
  {
    entity: "مناسبه",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
  {
    entity: "عضو",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
  {
    entity: "مستخدم",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
  {
    entity: "معرض الصور",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
  {
    entity: "ماليه",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
  {
    entity: "اعلان",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
];

export const superAdminPermissions = [
  { entity: "مناسبه", view: true, update: true, delete: true, create: true },
  {
    entity: "عضو",
    view: true,
    update: true,
    delete: true,
    create: true,
  },
  {
    entity: "مستخدم",
    view: true,
    update: true,
    delete: true,
    create: true,
  },
  {
    entity: "معرض الصور",
    view: true,
    update: true,
    delete: true,
    create: true,
  },
  {
    entity: "ماليه",
    view: true,
    update: true,
    delete: true,
    create: true,
  },
  {
    entity: "اعلان",
    view: true,
    update: true,
    delete: true,
    create: true,
  },
];

export const financialManager = [
  {
    entity: "ماليه",
    view: true,
    update: true,
    delete: true,
    create: true,
  },
];

export const socialManager = [
  { entity: "مناسبه", view: true, update: true, delete: true, create: true },
  {
    entity: "معرض الصور",
    view: true,
    update: true,
    delete: true,
    create: true,
  },
  {
    entity: "اعلان",
    view: true,
    update: true,
    delete: true,
    create: true,
  },
];

export const familyOlders = [
  {
    entity: "ماليه",
    view: true,
    update: false,
    delete: false,
    create: false,
  },
];

export const permissionSchema = new Schema(
  {
    entity: { type: String, required: true },
    ...actionPermissions,
  },
  { _id: false }
);

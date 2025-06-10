import mongoose, { Types } from "mongoose";

interface UserReference {
  id: string;
  name?: string;
  avatar?: string;
}

interface EntityReference {
  id?: Types.ObjectId;
  type: "مناسبه" | "عضو" | "اعلان" | "ماليه" | "معرض الصور" | "مستخدم";
  title?: string;
}

export interface INotification {
  message: string;
  action:
    | "create"
    | "update"
    | "delete"
    | "view"
    | "approve"
    | "reject"
    | "reminder";
  entity: EntityReference;
  sender: UserReference;
  recipientId: Types.ObjectId;
  readAt: Date | string | null;
  read: boolean;
  metadata?: {
    deepLink?: string;
    customData?: Record<string, any>;
    priority?: "low" | "medium" | "high";
  };
  status: "pending" | "sent" | "delivered" | "failed";
  isMobileDelivered?: boolean;
  isEmailDelivered?: boolean;
  isWebDelivered?: boolean;
}

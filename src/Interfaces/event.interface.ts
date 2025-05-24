import { Types } from "mongoose";

export default interface IEvent {
  userId: Types.ObjectId;
  address: string;
  description: string;
  eventLocation: string;
  startDate: Date;
  endDate: Date;
}

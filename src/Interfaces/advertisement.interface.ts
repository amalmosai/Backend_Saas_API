import { Types } from "mongoose";
export default interface IAdvertisement {
  userId: Types.ObjectId;
  address: string;
  type: string;
  content: string;
  image?: string;
}

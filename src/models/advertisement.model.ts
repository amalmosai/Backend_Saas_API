import { Schema, model, Types } from "mongoose";
import IAdvertisement from "../Interfaces/advertisement.interface";

const advertisementSchema = new Schema<IAdvertisement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    address: {
      type: String,
      required: [true, "The address is required"],
    },
    type: {
      type: String,
      enum: {
        values: ["important", "general", "social"],
        message: "{VALUE} is not supported",
      },
    },
    content: {
      type: String,
      required: [true, "The advertisement content is required"],
    },
    image: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

const Advertisement = model<IAdvertisement>(
  "advertisement",
  advertisementSchema
);

export default Advertisement;

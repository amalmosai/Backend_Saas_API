import mongoose, { Schema, Document } from "mongoose";
import IAlbum from "../Interfaces/album.interface";

const albumSchema = new Schema<IAlbum>(
  {
    name: {
      type: String,
      required: true,
    },
    images: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAlbum>("Album", albumSchema);

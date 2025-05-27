import mongoose from "mongoose";

export default interface IAlbum {
  name: string;
  images: string[];
  createdBy: mongoose.Types.ObjectId;
}

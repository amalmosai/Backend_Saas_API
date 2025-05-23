import multer, { FileFilterCallback } from "multer";
import express, { NextFunction, Request } from "express";
import path from "path";

const route = express.Router();
route.use(express.static("public/uploads"));

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

let filestorage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: DestinationCallback
  ) {
    cb(null, "public/uploads");
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: FileNameCallback
  ) {
    const extension = path.extname(file.originalname);
    console.log(file.originalname);
    const filename = `${Date.now()}${extension}`;
    cb(null, filename);
  },
});

const multerFilter = function (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  const acceptedMimetypes = ["image/jpeg", "image/png", "image/gif"];
  if (acceptedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
    throw new Error("Not an accepted image format");
  }
};

export const upload = multer({
  storage: filestorage,
  fileFilter: multerFilter,
});

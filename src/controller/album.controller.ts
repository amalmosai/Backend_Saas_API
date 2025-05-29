import { Request, Response, NextFunction } from "express";
import Album from "../models/album.model";
import asyncWrapper from "../middlewares/asynHandler";
import { createCustomError, HttpCode } from "../errors/customError";
import mongoose from "mongoose";
import Image from "../models/image.model";

class AlbumController {
  createAlbum = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { name, description } = req.body;
      const userId = req.user?.id;

      if (!name) {
        return next(
          createCustomError("Album name is required", HttpCode.BAD_REQUEST)
        );
      }

      if (!userId) {
        return next(createCustomError("Unauthorized", HttpCode.UNAUTHORIZED));
      }

      const album = await Album.create({
        name,
        description,
        createdBy: userId,
      });

      res.status(HttpCode.CREATED).json({
        success: true,
        data: album,
        message: "Album created successfully",
      });
    }
  );

  getAlbums = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const totalAlbums = await Album.countDocuments();

      const albums = await Album.find()
        .populate("images")
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalAlbums / limit);

      res.status(HttpCode.OK).json({
        success: true,
        pagination: {
          totalAlbums,
          totalPages,
          currentPage: page,
          pageSize: albums.length,
        },
        data: albums,
        message: "Get all albums successfully",
      });
    }
  );

  deleteAlbum = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const albumId = req.params.id;
      const album = await Album.findById(albumId);

      if (!album) {
        return next(createCustomError("Album not found", HttpCode.NOT_FOUND));
      }

      await album.deleteOne();

      res.status(HttpCode.OK).json({
        success: true,
        data: null,
        message: "Album deleted successfully",
      });
    }
  );

  getAlbumById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const albumId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(albumId)) {
        return next(
          createCustomError("Invalid album ID", HttpCode.BAD_REQUEST)
        );
      }

      const album = await Album.findById(albumId).populate(
        "createdBy",
        "-password"
      );

      if (!album) {
        return next(createCustomError("Album not found", HttpCode.NOT_FOUND));
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: album,
      });
    }
  );

  uploadImageAndAddToAlbum = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const albumId = req.params.id;
      let { image, description } = req.body;

      if (!req.file?.filename || !albumId) {
        return next(
          createCustomError(
            "Image URL and album ID are required",
            HttpCode.BAD_REQUEST
          )
        );
      }

      if (req.file?.filename) {
        image = req.file?.filename;
      }

      const newImage = await Image.create({ image, description });
      await newImage.save();

      const updatedAlbum = await Album.findByIdAndUpdate(
        albumId,
        { $push: { images: newImage._id } },
        { new: true }
      ).populate("images");

      if (!updatedAlbum) {
        return next(createCustomError("Album not found", HttpCode.NOT_FOUND));
      }

      res.status(HttpCode.OK).json({
        success: true,
        message: "Image uploaded and added to album",
        data: updatedAlbum,
      });
    }
  );
}

export default new AlbumController();

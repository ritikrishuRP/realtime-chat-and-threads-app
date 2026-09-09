import { Request, Router } from "express";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";

export const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

uploadRouter.post(
  "/image-upload",
  upload.single("file"),
  async (req: Request, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file provided",
        });
      }

      const file = req.file;

      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          error: "Only image files are allowed!",
        });
      }

      console.log(
        `[image-upload] file=${file.originalname} type=${file.mimetype} size=${file.size}`
      );

      const result = await new Promise<{
        secure_url: string;
        width: number;
        height: number;
      }>((resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: "real_time_chat_threads_app",
              resource_type: "image",
            },
            (err, uploaded) => {
              if (err) {
                console.error(
                  "[Cloudinary upload error]",
                  err
                );

                return reject(err);
              }

              if (!uploaded) {
                return reject(
                  new Error(
                    "Cloudinary returned no upload result"
                  )
                );
              }

              resolve({
                secure_url: uploaded.secure_url,
                width: uploaded.width,
                height: uploaded.height,
              });
            }
          );

        uploadStream.on("error", (err) => {
          console.error(
            "[Cloudinary stream error]",
            err
          );

          reject(err);
        });

        uploadStream.end(file.buffer);
      });

      return res.status(200).json({
        url: result.secure_url,
        width: result.width,
        height: result.height,
      });
    } catch (err) {
      console.error(
        "[image-upload] failed:",
        err
      );

      next(err);
    }
  }
);
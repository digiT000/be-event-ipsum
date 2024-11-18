import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
var fs = require("fs");

export let streamUpload = (image: Buffer): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      {
        folder: "events",
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    fs.createReadStream(image).pipe(stream);
  });
};

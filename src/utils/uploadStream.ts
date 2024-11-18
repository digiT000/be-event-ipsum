import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
var fs = require("fs");

// export let streamUpload = (image: Buffer): Promise<UploadApiResponse> => {
//   console.log("stream upload", image);
//   return new Promise((resolve, reject) => {
//     let stream = cloudinary.uploader.upload_stream(
//       {
//         folder: "events",
//       },
//       (error, result) => {
//         console.log(error, result);
//         if (result) {
//           console.log("callback result", result);
//           resolve(result);
//         } else {
//           reject(error);
//         }
//       }
//     );

//     fs.createReadStream(image).pipe(stream);
//   });
// };

export let streamUpload = (image: Buffer): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
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
      )
      .end(image); // Directly pipe the Buffer to the stream
  });
};

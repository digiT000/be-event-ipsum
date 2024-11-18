import multer from "multer";
import path from "path";
import cloudinary from "../config/cloudinary";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const destinationPath = path.join(__dirname, "../uploads/");
//     cb(null, destinationPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()} - ${file.originalname}`);
//   },
// });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // Max file size 2MB
  },
  fileFilter: async (req, file, cb) => {
    // Optional: Filter allowed file types
    const allowedMimes = ["image/jpeg", "image/png"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only images allowed!")
      );
    }
  },
});

export default upload;

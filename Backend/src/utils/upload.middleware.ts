import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const cleanOriginalName = (name: string): string => {
  return name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
};

export const createCloudinaryUploader = (folder: string) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder,
      format: file.mimetype.split("/")[1],
      public_id: `${Date.now()}-${cleanOriginalName(file.originalname)}`,
    }),
  });

  return multer({ storage });
};

const upload = createCloudinaryUploader("rooms");

export const serviceUpload = createCloudinaryUploader("services");

export default upload;

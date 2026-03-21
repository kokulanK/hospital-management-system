const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hospital_lab_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],   // ✅ only images
    resource_type: "auto"                             // still auto, but only images will pass
  },
});

const uploadLab = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
});

module.exports = uploadLab;
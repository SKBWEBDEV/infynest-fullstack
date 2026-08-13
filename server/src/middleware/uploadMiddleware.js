import multer from "multer";

// ==========================================
// MEMORY STORAGE
// ==========================================
// File আর server/uploads folder-এ save হবে না.
// File সরাসরি memory-তে থাকবে এবং Cloudinary-তে যাবে.

const storage = multer.memoryStorage();

// ==========================================
// FILE FILTER
// ==========================================

const checkFileType = (file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed!"));
  }
};

// ==========================================
// MULTER
// ==========================================

const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },

  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024, // 5MB per image
  },
});

export default upload;
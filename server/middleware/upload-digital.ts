import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Ensure storage directory exists
const storageDir = path.join(process.cwd(), "storage", "digital-library");
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, storageDir);
  },
  filename: function (req, file, cb) {
    // Keep a secure but traceable name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "digital-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common digital products
  const allowedTypes = [
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "application/octet-stream" // fallback for some browsers
  ];
  
  if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.zip') || file.originalname.endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and ZIP files are allowed."));
  }
};

export const uploadDigital = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // Strict 500MB limit
  },
});

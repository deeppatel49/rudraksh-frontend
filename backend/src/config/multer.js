import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function resolveUploadType(req, file) {
  const explicitType = String(req.body?.type || req.query?.type || "").trim().toLowerCase();
  if (explicitType === "images" || explicitType === "videos" || explicitType === "general") {
    return explicitType;
  }

  const mimeType = String(file?.mimetype || "").toLowerCase();
  const extension = String(path.extname(file?.originalname || "")).toLowerCase();
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

  if (mimeType.startsWith("video/") || videoExtensions.includes(extension)) {
    return "videos";
  }

  if (mimeType.startsWith("image/") || imageExtensions.includes(extension)) {
    return "images";
  }

  return "general";
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = resolveUploadType(req, file);
    const folderPath = path.join(uploadsDir, folder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase() || "upload";
    cb(null, `${name}-${uniqueSuffix}${ext.toLowerCase()}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const uploadType = resolveUploadType(req, file);
  const mimeType = String(file?.mimetype || "").toLowerCase();
  const extension = String(path.extname(file?.originalname || "")).toLowerCase();

  if (uploadType === "images") {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg", ".heic", ".heif"];
    if (mimeType.startsWith("image/") || allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  } else if (uploadType === "videos") {
    const allowedExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
    if (mimeType.startsWith("video/") || mimeType === "application/octet-stream" || allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Only video files (MP4, WebM, OGG, MOV, AVI, MKV) are allowed."));
    }
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
});

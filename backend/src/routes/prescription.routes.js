import express from "express";
import multer from "multer";
import { getByReferenceId, list, updateProcessing, upload } from "../controllers/prescription.controller.js";

const router = express.Router();

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, or PDF files are allowed."));
    }
  },
});

function handleMulterError(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size must be 5 MB or less." });
    }
    return res.status(400).json({ error: err.message || "File upload error." });
  }
  if (err?.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
}

// POST /api/v1/prescriptions/upload — multipart file upload to Supabase Storage
router.post("/upload", memoryUpload.single("prescription"), handleMulterError, upload);

// GET /api/v1/prescriptions — list all (admin) or by ?mobile=<number>
router.get("/", list);

// PUT /api/v1/prescriptions/processing — update processing mode for multiple prescriptions
router.put("/processing", updateProcessing);

// GET /api/v1/prescriptions/:referenceId — get one by reference ID
router.get("/:referenceId", getByReferenceId);

export default router;

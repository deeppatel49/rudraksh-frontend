import { Router } from "express";
import { upload } from "../config/multer.js";
import { requireSessionAuth } from "../middleware/session.middleware.js";
import { getAboutContent, getHomeContent, getSeoMeta } from "../controllers/content.controller.js";

const router = Router();

router.get("/home", getHomeContent);
router.get("/about", getAboutContent);
router.get("/seo/:pageSlug", getSeoMeta);
router.post("/upload", requireSessionAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided." });
    }

    const folder = String(req.body.type || req.query.type || "general").trim() || "general";
    const normalizedFolder = folder.replace(/[^a-z0-9_-]/gi, "");
    const fileUrl = `/uploads/${normalizedFolder}/${req.file.filename}`;

    return res.json({
      success: true,
      file: {
        url: fileUrl,
        absoluteUrl: `${req.protocol}://${req.get("host")}${fileUrl}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to upload file." });
  }
});

export default router;

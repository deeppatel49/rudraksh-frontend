import { Router } from "express";
import { upload } from "../config/multer.js";
import { requireSessionAuth } from "../middleware/session.middleware.js";
import { createBanner, fetchAllBanners, removeBanner, toggleBannerStatus } from "../services/banners.service.js";

const router = Router();

// Upload banner (image or video)
router.post("/upload", requireSessionAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided." });
    }

    const { title, description } = req.body;
    const banner = await createBanner({ file: req.file, title, description });

    res.json({
      success: true,
      message: "Banner uploaded successfully.",
      banner,
    });
  } catch (error) {
    console.error("Error uploading banner:", error);
    res.status(500).json({
      error: error.message || "Failed to upload banner.",
    });
  }
});

// Get all banners
router.get("/", requireSessionAuth, async (req, res) => {
  try {
    const banners = await fetchAllBanners();
    res.json({ banners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ error: error.message || "Failed to fetch banners." });
  }
});

// Delete banner
router.delete("/:id", requireSessionAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await removeBanner(id);
    res.json({ success: true, message: "Banner deleted successfully." });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ error: error.message || "Failed to delete banner." });
  }
});

// Toggle banner status
router.patch("/:id/status", requireSessionAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be a boolean." });
    }

    await toggleBannerStatus(id, isActive);
    res.json({ success: true, message: "Banner status updated." });
  } catch (error) {
    console.error("Error updating banner status:", error);
    res.status(500).json({ error: error.message || "Failed to update banner status." });
  }
});

export default router;

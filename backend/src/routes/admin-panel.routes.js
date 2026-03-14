import { Router } from "express";
import multer from "multer";
import {
  renderLoginPage,
  renderSignupPage,
  renderDashboardPage,
  renderContentManagerPage,
  renderContentEditorPage,
  renderAdminSectionPage,
  renderCustomerChatPage,
  renderChatBoxPage,
  fetchChatData,
  deleteChat,
  handleAdminProfileUpdate,
  handleSignup,
  handleSignin,
  handleSignout,
  handleContentUpdate,
  handleMessageStatusUpdate,
  handleProductUpdate,
  handleSellerChatMessage,
} from "../controllers/admin-panel.controller.js";
import { requireSessionAuth } from "../middleware/session.middleware.js";
import { upload } from "../config/multer.js";

const router = Router();

// Public routes
router.get("/login", renderLoginPage);
router.post("/login", handleSignin);
router.get("/signup", renderSignupPage);
router.post("/signup", handleSignup);

// Protected routes
router.get("/dashboard", requireSessionAuth, renderDashboardPage);
router.get("/chat-box", requireSessionAuth, renderChatBoxPage);
router.get("/api/chat/data", requireSessionAuth, fetchChatData);
router.post("/api/chat/delete", requireSessionAuth, deleteChat);
router.get("/section/:section", requireSessionAuth, renderAdminSectionPage);
router.get("/customer-chat", requireSessionAuth, renderCustomerChatPage);
router.get("/content", requireSessionAuth, renderContentManagerPage);
router.get("/content/:slug", requireSessionAuth, renderContentEditorPage);
router.post("/content/upload", requireSessionAuth, upload.single("file"), async (req, res) => {
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
router.post(
  "/content/:slug",
  requireSessionAuth,
  upload.any(),
  handleContentUpdate
);
router.post("/profile/update", requireSessionAuth, handleAdminProfileUpdate);
router.post("/products/update", requireSessionAuth, handleProductUpdate);
router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.redirect(`/admin/content/home?error=${encodeURIComponent(error.message || "File upload failed.")}`);
  }

  if (error?.message && /Only image files|Only video files/i.test(error.message)) {
    return res.redirect(`/admin/content/home?error=${encodeURIComponent(error.message)}`);
  }

  return next(error);
});
router.post("/messages/status", requireSessionAuth, handleMessageStatusUpdate);
router.post("/customer-chat/send", requireSessionAuth, upload.single("attachment"), handleSellerChatMessage);
router.post("/logout", handleSignout);

export default router;

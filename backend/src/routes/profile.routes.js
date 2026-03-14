import { Router } from "express";
import { getOwnProfile, patchOwnProfile } from "../controllers/profile.controller.js";
import { requireAdminAuth } from "../middleware/require-admin-auth.js";

const router = Router();

router.get("/me", requireAdminAuth, getOwnProfile);
router.patch("/me", requireAdminAuth, patchOwnProfile);

export default router;

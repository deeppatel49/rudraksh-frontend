import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";
import { requireAdminAuth } from "../middleware/require-admin-auth.js";

const router = Router();

router.get("/summary", requireAdminAuth, getDashboardSummary);

export default router;

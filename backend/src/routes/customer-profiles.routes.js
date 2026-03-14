import { Router } from "express";
import { readCustomerProfiles, upsertCustomerProfile } from "../repositories/customer-auth.repository.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId = String(req.query?.userId || "").trim();
    const profiles = await readCustomerProfiles(userId ? { userId } : {});
    return res.json({ profiles });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Unable to load profiles." });
  }
});

router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    const item = await upsertCustomerProfile({
      ...payload.profile,
      userId: payload.userId,
    });

    return res.status(201).json({ message: "Profile saved.", profile: item });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Unable to save profile." });
  }
});

export default router;

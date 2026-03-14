import { Router } from "express";
import {
  checkAccountExists,
  createLoginActivity,
  getRecoveryContacts,
  getSession,
  loginWithGoogle,
  loginWithPassword,
  register,
  resetPassword,
  updateProfile,
} from "../controllers/customer-auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login/password", loginWithPassword);
router.post("/login/google", loginWithGoogle);
router.post("/reset-password", resetPassword);
router.post("/login-activity", createLoginActivity);
router.get("/session", getSession);
router.get("/account-exists", checkAccountExists);
router.get("/recovery-contacts", getRecoveryContacts);
router.put("/profile", updateProfile);

export default router;

import { Router } from "express";
import { getMe, signIn, signOut, signUp } from "../controllers/auth.controller.js";

const router = Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.get("/me", getMe);
router.post("/sign-out", signOut);

export default router;

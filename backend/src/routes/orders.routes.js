import { Router } from "express";
import { getOrder, getOrders, getUserOrders } from "../controllers/orders.controller.js";

const router = Router();

router.get("/", getOrders);
router.get("/:id", getOrder);
router.get("/user/:userId", getUserOrders);

export default router;

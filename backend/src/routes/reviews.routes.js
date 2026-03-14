import { Router } from "express";
import {
  getHomeReviews,
  getProductReviews,
  postHomeReview,
  postProductReview,
} from "../controllers/reviews.controller.js";

const router = Router();

router.get("/home", getHomeReviews);
router.post("/home", postHomeReview);
router.get("/:productId", getProductReviews);
router.post("/:productId", postProductReview);

export default router;

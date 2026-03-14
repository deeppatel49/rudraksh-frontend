import {
  createHomeReview,
  createProductReview,
  fetchHomeReviews,
  fetchProductReviews,
  validateHomeReviewPayload,
  validateReviewPayload,
} from "../services/reviews.service.js";
import { badRequest, created, ok } from "../utils/http.js";

export async function getHomeReviews(req, res, next) {
  try {
    return ok(res, await fetchHomeReviews());
  } catch (error) {
    return next(error);
  }
}

export async function postHomeReview(req, res, next) {
  try {
    const parsed = validateHomeReviewPayload(req.body);
    if (!parsed.success) {
      return badRequest(res, "Invalid review payload.", parsed.error.flatten());
    }

    return created(res, await createHomeReview(parsed.data));
  } catch (error) {
    return next(error);
  }
}

export async function getProductReviews(req, res, next) {
  try {
    return ok(res, await fetchProductReviews(req.params.productId));
  } catch (error) {
    return next(error);
  }
}

export async function postProductReview(req, res, next) {
  try {
    const parsed = validateReviewPayload(req.body);
    if (!parsed.success) {
      return badRequest(res, "Invalid review payload.", parsed.error.flatten());
    }

    return created(res, await createProductReview(req.params.productId, parsed.data));
  } catch (error) {
    return next(error);
  }
}

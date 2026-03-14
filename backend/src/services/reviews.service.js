import { z } from "zod";
import { createReview, listReviewsByProductId } from "../repositories/reviews.repository.js";

const reviewSchema = z.object({
  reviewerName: z.string().min(2),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(4),
  description: z.string().min(10),
  imageDataUrl: z.string().optional().or(z.literal("")),
});

const homeReviewSchema = z.object({
  name: z.string().min(2),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(10),
});

function summarize(reviews) {
  if (!reviews.length) {
    return { totalReviews: 0, averageRating: 0 };
  }

  const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
  return {
    totalReviews: reviews.length,
    averageRating: Number((total / reviews.length).toFixed(1)),
  };
}

function toApiReview(row) {
  return {
    id: row.id,
    productId: row.product_id,
    reviewerName: row.reviewer_name,
    rating: row.rating,
    title: row.title,
    description: row.description,
    imageDataUrl: row.image_data_url || "",
    date: new Date(row.created_at).toISOString().slice(0, 10),
  };
}

function toHomeReview(row) {
  return {
    id: row.id,
    name: row.reviewer_name,
    rating: row.rating,
    message: row.description,
    date: new Date(row.created_at).toISOString().slice(0, 10),
  };
}

export function validateReviewPayload(payload) {
  return reviewSchema.safeParse(payload);
}

export function validateHomeReviewPayload(payload) {
  return homeReviewSchema.safeParse(payload);
}

export async function fetchProductReviews(productId) {
  const rows = await listReviewsByProductId(productId);
  const reviews = rows.map(toApiReview);
  return {
    productId,
    ...summarize(reviews),
    reviews,
  };
}

export async function createProductReview(productId, payload) {
  const created = await createReview({
    product_id: productId,
    reviewer_name: payload.reviewerName,
    rating: payload.rating,
    title: payload.title,
    description: payload.description,
    image_data_url: payload.imageDataUrl || null,
  });

  const response = await fetchProductReviews(productId);
  return {
    message: "Review submitted successfully.",
    review: toApiReview(created),
    ...response,
  };
}

export async function fetchHomeReviews() {
  const rows = await listReviewsByProductId("homepage");
  const reviews = rows.map(toHomeReview);
  return {
    ...summarize(reviews),
    reviews,
  };
}

export async function createHomeReview(payload) {
  await createReview({
    product_id: "homepage",
    reviewer_name: payload.name,
    rating: payload.rating,
    title: "Website Review",
    description: payload.message,
    image_data_url: null,
  });

  return {
    message: "Review submitted successfully.",
    ...(await fetchHomeReviews()),
  };
}

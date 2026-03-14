import { promises as fs } from "node:fs";
import path from "node:path";

const REVIEWS_DB_PATH = path.join(process.cwd(), "app", "data", "reviews-db.json");

function safeParseReviews(content) {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sortByDateDesc(reviews) {
  return [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function createReviewId() {
  return `r${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export async function getAllReviews() {
  const fileContent = await fs.readFile(REVIEWS_DB_PATH, "utf8");
  return safeParseReviews(fileContent);
}

export async function getReviewsByProductId(productId) {
  const allReviews = await getAllReviews();
  const filteredReviews = allReviews.filter((review) => review.productId === productId);
  return sortByDateDesc(filteredReviews);
}

export async function addReview(productId, inputReview) {
  const allReviews = await getAllReviews();
  const imageDataUrl = String(inputReview?.imageDataUrl || "").trim();
  const newReview = {
    id: createReviewId(),
    productId,
    reviewerName: inputReview.reviewerName,
    rating: Number(inputReview.rating),
    title: inputReview.title,
    description: inputReview.description,
    date: new Date().toISOString().slice(0, 10),
    ...(imageDataUrl ? { imageDataUrl } : {}),
  };

  const updatedReviews = [...allReviews, newReview];
  await fs.writeFile(REVIEWS_DB_PATH, JSON.stringify(updatedReviews, null, 2), "utf8");
  return newReview;
}

export function getReviewSummary(reviews) {
  if (!reviews.length) {
    return {
      totalReviews: 0,
      averageRating: 0,
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  const averageRating = totalRating / reviews.length;

  return {
    totalReviews: reviews.length,
    averageRating: Number(averageRating.toFixed(1)),
  };
}

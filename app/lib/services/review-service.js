import { addReview, getReviewSummary, getReviewsByProductId } from "../reviews-db";

function mapHomeReview(review) {
  return {
    id: review.id,
    name: review.reviewerName,
    rating: review.rating,
    message: review.description,
    date: review.date,
  };
}

export async function getHomeReviews() {
  const reviews = await getReviewsByProductId("homepage");
  const summary = getReviewSummary(reviews);

  return {
    ...summary,
    reviews: reviews.map(mapHomeReview),
  };
}

export async function submitHomeReview(payload) {
  await addReview("homepage", {
    reviewerName: String(payload.name).trim(),
    rating: Number(payload.rating),
    title: "Website Review",
    description: String(payload.message).trim(),
  });

  return getHomeReviews();
}

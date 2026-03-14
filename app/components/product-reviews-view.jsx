"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/auth-context";
import { hasDeliveredPurchaseForProduct } from "../lib/order-client";
import { createBackendApiUrl } from "../lib/backend-api";

const FORM_DEFAULTS = {
  reviewerName: "",
  rating: "5",
  title: "",
  description: "",
  imageDataUrl: "",
};

function formatReviewDate(isoDate) {
  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function getStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return "\u2605".repeat(safeRating) + "\u2606".repeat(5 - safeRating);
}

export function ProductReviewsView({ productId, productName }) {
  const { user, isHydrated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");

  const [formData, setFormData] = useState(FORM_DEFAULTS);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setError("");
      const response = await fetch(createBackendApiUrl(`/reviews/${productId}`), {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load reviews right now.");
      }

      const payload = await response.json();
      setReviews(Array.isArray(payload.reviews) ? payload.reviews : []);
      setAverageRating(Number(payload.averageRating) || 0);
      setLastUpdatedAt(payload.lastUpdatedAt || "");
    } catch (fetchError) {
      setError(fetchError?.message || "Unable to load reviews right now.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    let active = true;

    async function runLoad() {
      if (!active) {
        return;
      }
      setLoading(true);
      await loadReviews();
    }

    runLoad();
    const intervalId = setInterval(() => {
      if (active) {
        loadReviews();
      }
    }, 30000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [loadReviews]);

  const canSubmitReview = useMemo(() => {
    if (!isHydrated || !user?.id) {
      return false;
    }

    return hasDeliveredPurchaseForProduct(user.id, productId);
  }, [isHydrated, productId, user?.id]);

  const updateText = useMemo(() => {
    if (!lastUpdatedAt) {
      return "Live sync active";
    }

    const formattedDate = formatReviewDate(lastUpdatedAt);
    return `Live sync active | Updated ${formattedDate}`;
  }, [lastUpdatedAt]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch(createBackendApiUrl(`/reviews/${productId}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewerName: formData.reviewerName.trim(),
          rating: Number(formData.rating),
          title: formData.title.trim(),
          description: formData.description.trim(),
          imageDataUrl: formData.imageDataUrl,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to submit review.");
      }

      setReviews(Array.isArray(payload.reviews) ? payload.reviews : []);
      setAverageRating(Number(payload.averageRating) || 0);
      setLastUpdatedAt(payload.lastUpdatedAt || "");
      setFormData(FORM_DEFAULTS);
      setFormSuccess("Thank you. Your review has been submitted.");
    } catch (submitError) {
      setFormError(submitError?.message || "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  function onFieldChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function onImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setFormData((prev) => ({
        ...prev,
        imageDataUrl: "",
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        imageDataUrl: String(reader.result || ""),
      }));
    };
    reader.onerror = () => {
      setFormError("Unable to read selected image.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="section section-soft product-reviews-page">
      <div className="container">
        <div className="reviews-page-head">
          <Link href={`/products/${productId}`} className="reviews-back-link">
            {"<-"} Back to Product
          </Link>
          <p className="reviews-kicker">Product Review</p>
          <h1>{productName}</h1>
          <p>
            Verified customer feedback to help you make informed purchase decisions.
          </p>
        </div>

        <section className="reviews-summary-grid" aria-label="Review summary">
          <article className="reviews-summary-card">
            <p>Average Rating</p>
            <h2>{averageRating ? `${averageRating} / 5` : "No ratings yet"}</h2>
          </article>
          <article className="reviews-summary-card">
            <p>Total Review</p>
            <h2>{reviews.length}</h2>
          </article>
          <article className="reviews-summary-card">
            <p>Status</p>
            <h2>{updateText}</h2>
          </article>
        </section>

        {canSubmitReview ? (
          <section className="review-form-shell" aria-label="Write a review">
            <h2>Write a Review</h2>
            <p>Share your experience with this product.</p>

            <form className="review-form-grid" onSubmit={handleSubmit}>
              <label className="review-form-field">
                <span>Your Name</span>
                <input
                  type="text"
                  name="reviewerName"
                  value={formData.reviewerName}
                  onChange={onFieldChange}
                  minLength={2}
                  required
                />
              </label>

              <label className="review-form-field">
                <span>Rating</span>
                <select name="rating" value={formData.rating} onChange={onFieldChange} required>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Very Poor</option>
                </select>
              </label>

              <label className="review-form-field review-form-wide">
                <span>Review Title</span>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={onFieldChange}
                  minLength={4}
                  required
                />
              </label>

              <label className="review-form-field review-form-wide">
                <span>Description</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={onFieldChange}
                  minLength={10}
                  rows={4}
                  required
                />
              </label>

              <label className="review-form-field review-form-wide">
                <span>Upload Image (Optional)</span>
                <input type="file" accept="image/*" onChange={onImageChange} />
              </label>

              <div className="review-form-actions review-form-wide">
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                {formError ? <p className="review-form-msg error">{formError}</p> : null}
                {formSuccess ? <p className="review-form-msg success">{formSuccess}</p> : null}
              </div>
            </form>
          </section>
        ) : (
          <div className="reviews-state-card">
            {!user ? (
              <p>
                Login and place a delivered order to submit a review. <Link href="/login">Login</Link>
              </p>
            ) : (
              <p>
                Review submission is available only after successful delivery. You can submit
                from delivered items in your <Link href="/profile">order details</Link>.
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="reviews-state-card">
            <p>Loading latest reviews...</p>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="reviews-state-card error">
            <p>{error}</p>
          </div>
        ) : null}

        {!loading && !error && !reviews.length ? (
          <div className="reviews-state-card">
            <p>No reviews available for this product yet.</p>
          </div>
        ) : null}

        {!loading && !error && reviews.length ? (
          <div className="reviews-grid">
            {reviews.map((review, index) => (
              <article
                key={review.id}
                className="review-card"
                style={{ "--review-delay": `${index * 90}ms` }}
              >
                <div className="review-card-top">
                  <div>
                    <h3>{review.title}</h3>
                    <p className="reviewer-name">{review.reviewerName}</p>
                  </div>
                  <p className="review-date">{formatReviewDate(review.date)}</p>
                </div>
                <p className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                  {getStars(review.rating)}
                </p>
                <p className="review-description">{review.description}</p>
                {review.imageDataUrl ? (
                  <div className="review-image-wrap">
                    <Image
                      src={review.imageDataUrl}
                      alt={`Review by ${review.reviewerName}`}
                      width={480}
                      height={320}
                      unoptimized
                    />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const HOME_REVIEWS_API = "/api/reviews/home";

const FORM_DEFAULTS = {
  name: "",
  rating: "5",
  message: "",
};

function getStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return "\u2605".repeat(safeRating) + "\u2606".repeat(5 - safeRating);
}

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

export function HomeReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(FORM_DEFAULTS);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setError("");
      const response = await fetch(HOME_REVIEWS_API, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load reviews right now.");
      }

      const payload = await response.json();
      setReviews(Array.isArray(payload.reviews) ? payload.reviews : []);
      setAverageRating(Number(payload.averageRating) || 0);
    } catch (fetchError) {
      setError(fetchError?.message || "Unable to load reviews right now.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  const summaryText = useMemo(() => {
    if (!reviews.length) {
      return "No reviews yet";
    }

    return `${averageRating.toFixed(1)} / 5 average from ${reviews.length} reviews`;
  }, [averageRating, reviews.length]);

  function onFieldChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    const name = formData.name.trim();
    const message = formData.message.trim();
    const rating = Number(formData.rating);

    if (name.length < 2) {
      setFormError("Name must be at least 2 characters.");
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setFormError("Rating must be between 1 and 5.");
      return;
    }

    if (message.length < 10) {
      setFormError("Review message must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(HOME_REVIEWS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          rating,
          message,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to submit review.");
      }

      setReviews(Array.isArray(payload.reviews) ? payload.reviews : []);
      setAverageRating(Number(payload.averageRating) || 0);
      setFormData(FORM_DEFAULTS);
      setFormSuccess("Thank you. Your review has been submitted.");
    } catch (submitError) {
      setFormError(submitError?.message || "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section section-soft home-reviews-section">
      <div className="container">
        <div className="section-head">
          <h2>What Customers Say</h2>
          <p>Share your experience and see what other customers are saying.</p>
        </div>

        <section className="reviews-summary-grid home-reviews-summary" aria-label="Website reviews summary">
          <article className="reviews-summary-card">
            <p>Average Rating</p>
            <h2>{summaryText}</h2>
          </article>
        </section>

        <section className="review-form-shell" aria-label="Submit website review">
          <h2>Write a Review</h2>
          <p>Your feedback helps improve the experience for everyone.</p>

          <form className="review-form-grid" onSubmit={handleSubmit}>
            <label className="review-form-field">
              <span>Your Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
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
              <span>Review Message</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={onFieldChange}
                rows={4}
                minLength={10}
                required
              />
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
            <p>No reviews have been posted yet.</p>
          </div>
        ) : null}

        {!loading && !error && reviews.length ? (
          <div className="reviews-grid home-reviews-grid">
            {reviews.map((review, index) => (
              <article
                key={review.id}
                className="review-card"
                style={{ "--review-delay": `${index * 80}ms` }}
              >
                <div className="review-card-top">
                  <div>
                    <h3>{review.name}</h3>
                  </div>
                  <p className="review-date">{formatReviewDate(review.date)}</p>
                </div>
                <p className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                  {getStars(review.rating)}
                </p>
                <p className="review-description">{review.message}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

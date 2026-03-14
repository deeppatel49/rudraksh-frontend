"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
const HOME_REVIEWS_API = "/api/reviews/home";

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

export function HomeReviewsMarquee() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      setError("");
      const response = await fetch(HOME_REVIEWS_API, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load customer reviews.");
      }

      const payload = await response.json();
      setReviews(Array.isArray(payload.reviews) ? payload.reviews : []);
    } catch (fetchError) {
      setError(fetchError?.message || "Unable to load customer reviews.");
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

  return (
    <section className="section section-soft">
      <div className="container testimonials-wrap">
        <div className="section-head">
          <h2>What Customers Say</h2>
          <p>Real feedback from customers who shop with Rudraksh Pharmacy.</p>
        </div>

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
            <p>
              No reviews have been posted yet. <Link href="/reviews">Write the first review</Link>.
            </p>
          </div>
        ) : null}

        {!loading && !error && reviews.length ? (
          <>
            <div className="testimonials-marquee">
              <div className="testimonials-track">
                {[(reviews.length > 1 ? [...reviews, ...reviews] : reviews)].flat().map((item, index) => (
                  <article
                    key={`${item.id}-${index}`}
                    className="testimonial-card"
                    aria-hidden={reviews.length > 1 ? index >= reviews.length : false}
                  >
                    <div className="testimonial-meta">
                      <h3>{item.name}</h3>
                      <span className="testimonial-date">{formatReviewDate(item.date)}</span>
                    </div>
                    <div className="testimonial-stars" aria-label={`${item.rating} out of 5 stars`}>
                      {getStars(item.rating)}
                    </div>
                    <p className="testimonial-message">{item.message}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="testimonials-review-action">
              <Link href="/reviews" className="primary-btn">
                Write a Review
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

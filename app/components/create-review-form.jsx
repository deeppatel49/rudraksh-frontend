"use client";

import { useState } from "react";
import { createBackendApiUrl } from "../lib/backend-api";

const FORM_DEFAULTS = {
  reviewerName: "",
  rating: "5",
  title: "",
  description: "",
};

export function CreateReviewForm({ productId }) {
  const [formData, setFormData] = useState(FORM_DEFAULTS);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to submit review.");
      }

      setFormData(FORM_DEFAULTS);
      setFormSuccess("Thank you. Your review has been submitted.");
    } catch (submitError) {
      setFormError(submitError?.message || "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="review-form-shell" aria-label="Create review form">
      <h2>Create Review</h2>
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

        <div className="review-form-actions review-form-wide">
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
          {formError ? <p className="review-form-msg error">{formError}</p> : null}
          {formSuccess ? <p className="review-form-msg success">{formSuccess}</p> : null}
        </div>
      </form>
    </section>
  );
}

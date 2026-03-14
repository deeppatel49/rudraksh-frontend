"use client";

import { useState } from "react";
import { useAuth } from "../context/auth-context";
import { createOrUpdateMessageStatus } from "../lib/services/message-status-service";

const WHATSAPP_NUMBER = "919979979688";

export function ContactInquiryForm({
  initialInquiryType = "",
  initialMessage = "",
}) {
  const { user } = useAuth();
  const allowedInquiryTypes = new Set([
    "Medicine Availability",
    "Order Support",
    "Bulk Purchase",
    "Prescription Help",
  ]);
  const safeInitialInquiryType = allowedInquiryTypes.has(initialInquiryType)
    ? initialInquiryType
    : "Medicine Availability";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: safeInitialInquiryType,
    message: initialMessage || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          inquiryType: formData.inquiryType,
          message: formData.message,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to submit inquiry.");
      }

      if (payload?.submissionId) {
        await createOrUpdateMessageStatus({
          messageId: payload.submissionId,
          status: "not-read",
          source: "contact_submissions",
          updatedBy: user?.id || formData.email,
          metadata: {
            inquiryType: formData.inquiryType,
            from: "frontend-contact-form",
          },
        });
      }

      let messageLines = [
        "*New Customer Inquiry*",
        "Rudraksh Pharmacy",
        "",
        `Inquiry Type: ${formData.inquiryType}`,
        `Name: ${formData.name}`,
        `Email: ${formData.email}`,
        `Phone: ${formData.phone || "Not provided"}`,
      ];

      // Add delivery details if user is logged in
      if (user) {
        messageLines.push(
          `Delivery Address: ${user.address || "Not provided"}`,
          `Pin Code: ${user.pincode || "Not provided"}`
        );
      }

      messageLines.push(
        "",
        `Message: ${formData.message}`,
        "",
        `Submission ID: ${payload?.submissionId || "N/A"}`,
        "Please share medicine availability and next steps."
      );

      const text = messageLines.join("\n");

      const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(link, "_blank", "noopener,noreferrer");

      setFormSuccess("Inquiry submitted successfully.");
      setFormData((prev) => ({
        ...prev,
        message: "",
      }));
    } catch (error) {
      setFormError(error?.message || "Unable to submit inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="content-card contact-form" aria-label="Contact form" onSubmit={handleSubmit}>
      <h2>Send an Inquiry</h2>
      <p className="contact-form-subtitle">
        Share your requirement and get a fast response from our support team.
      </p>

      <label htmlFor="inquiryType">Inquiry Type</label>
      <select
        id="inquiryType"
        name="inquiryType"
        required
        value={formData.inquiryType}
        onChange={handleChange}
      >
        <option>Medicine Availability</option>
        <option>Order Support</option>
        <option>Bulk Purchase</option>
        <option>Prescription Help</option>
      </select>

      <label htmlFor="name">Full Name</label>
      <input
        id="name"
        name="name"
        type="text"
        placeholder="Your name"
        required
        value={formData.name}
        onChange={handleChange}
      />

      <label htmlFor="email">Email Address</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
        value={formData.email}
        onChange={handleChange}
      />

      <label htmlFor="phone">Mobile Number</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        inputMode="numeric"
        placeholder="10-digit number"
        value={formData.phone}
        onChange={handleChange}
      />

      <label htmlFor="message">Message</label>
      <textarea
        id="message"
        name="message"
        rows="5"
        placeholder="Example: I need BP medicine and delivery by today."
        required
        value={formData.message}
        onChange={handleChange}
      />

      <button type="submit" className="primary-btn" disabled={submitting}>
        {submitting ? "Submitting..." : "Send Inquiry on WhatsApp"}
      </button>

      {formError ? <p className="review-form-msg error">{formError}</p> : null}
      {formSuccess ? <p className="review-form-msg success">{formSuccess}</p> : null}
    </form>
  );
}

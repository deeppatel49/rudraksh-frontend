"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { hasDeliveredPurchaseForProduct } from "../lib/order-client";

export function ProductDetailActions({ productId, productName, productPrice = 0, productImage = "" }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const canReview = user?.id ? hasDeliveredPurchaseForProduct(user.id, productId) : false;

  const redirectToLogin = (actionType) => {
    const params = new URLSearchParams({
      next: `/products/${productId}`,
      action: actionType,
      productId,
      quantity: String(Math.max(1, quantity)),
      pname: productName || "Product",
      pprice: String(Number(productPrice) || 0),
      pimg: productImage || "/products/default-medicine.svg",
    });
    router.push(`/login?${params.toString()}`);
  };

  const handleInquiry = () => {
    const params = new URLSearchParams({
      inquiryType: "Medicine Availability",
      message: `I want inquiry for ${productName}. Quantity: ${quantity}.`,
    });
    router.push(`/contact?${params.toString()}`);
  };

  const handleQuotation = () => {
    const params = new URLSearchParams({
      inquiryType: "Quotation Request",
      message: `Please share quotation for ${productName}. Quantity: ${quantity}.`,
    });
    router.push(`/contact?${params.toString()}`);
  };

  const handleReviewAccess = () => {
    if (!user) {
      redirectToLogin("review_product");
      return;
    }

    router.push("/profile");
  };

  return (
    <div className="product-detail-cart">
      <div className="product-qty-wrap">
        <label htmlFor={`detail-qty-${productId}`} className="product-qty-label">
          Quantity
        </label>
        <div className="product-qty-control">
          <button
            type="button"
            aria-label={`Decrease quantity for ${productName}`}
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          >
            -
          </button>
          <input
            id={`detail-qty-${productId}`}
            type="number"
            min="1"
            max="99"
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Math.min(99, Number(event.target.value) || 1)))}
          />
          <button
            type="button"
            aria-label={`Increase quantity for ${productName}`}
            onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
          >
            +
          </button>
        </div>
        {quantity === 99 ? <p className="product-qty-note warning">Maximum quantity reached</p> : null}
      </div>

      <div className="product-detail-cart-actions">
        <button type="button" className="primary-btn" onClick={handleQuotation}>
          Get Quotation
        </button>
        <button type="button" className="secondary-btn" onClick={handleInquiry}>
          Inquiry
        </button>
        {canReview ? (
          <Link href={`/products/${productId}/reviews`} className="secondary-btn">
            Write Review
          </Link>
        ) : (
          <button type="button" className="secondary-btn" onClick={handleReviewAccess}>
            Review after Delivery
          </button>
        )}
      </div>
    </div>
  );
}

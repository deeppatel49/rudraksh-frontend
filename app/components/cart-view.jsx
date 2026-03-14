"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/cart-context";
import { useAuth } from "../context/auth-context";

export function CartView() {
  const router = useRouter();
  const { user, isHydrated: isAuthHydrated } = useAuth();
  const {
    cartItems,
    itemCount,
    updateItemQuantity,
    removeItem,
    clearCart,
  } = useCart();

  useEffect(() => {
    if (isAuthHydrated && !user) {
      router.replace("/login?next=/cart");
    }
  }, [isAuthHydrated, router, user]);

  if (!user) {
    return null;
  }

  return (
    <section className="section container">
      <div className="section-head">
        <h1>Your Cart</h1>
        <p>Review selected products, update quantity, and continue checkout.</p>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {cartItems.length === 0 ? (
            <article className="content-card">
              <h2>Your cart is empty</h2>
              <p>Add products from the product page to continue.</p>
              <Link href="/products" className="primary-btn">
                Browse Products
              </Link>
            </article>
          ) : (
            cartItems.map((item) => (
              <article key={item.id} className="cart-item-card">
                <div className="cart-item-image-wrap">
                  <Image
                    src={item.image || "/products/default-medicine.svg"}
                    alt={item.imageAlt || item.name}
                    width={220}
                    height={140}
                    className="cart-item-image"
                  />
                </div>
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>{item.category}</p>
                  <strong>Inquiry & Quotation</strong>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-actions">
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                      aria-label={`Decrease quantity for ${item.name}`}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItemQuantity(item.id, Number(event.target.value) || 0)
                      }
                      aria-label={`Quantity for ${item.name}`}
                    />
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase quantity for ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="order-summary">
          <div className="summary-headline">
            <h3>Cart Summary</h3>
            <span>Live Updates</span>
          </div>
          <div className="summary-breakup">
            <p>
              <span>Total Items</span>
              <strong>{itemCount}</strong>
            </p>
            <p>
              <span>Shipping</span>
              <strong>Free</strong>
            </p>
          </div>
          <div className="summary-total">
            <span>Pricing</span>
            <strong>Shared on inquiry / quotation</strong>
          </div>
          <div className="cart-summary-actions">
            <Link href="/products" className="secondary-btn summary-btn">
              Add More Products
            </Link>
            <Link href="/checkout" className="primary-btn summary-btn">
              Continue Checkout
            </Link>
            {cartItems.length > 0 ? (
              <button type="button" className="secondary-btn summary-btn" onClick={clearCart}>
                Clear Cart
              </button>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}

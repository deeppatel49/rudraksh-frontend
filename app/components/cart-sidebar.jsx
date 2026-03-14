"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/cart-context";

export function CartSidebar() {
  const {
    cartItems,
    isSidebarOpen,
    closeSidebar,
    updateItemQuantity,
    removeItem,
  } = useCart();

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="cart-sidebar-backdrop"
        onClick={closeSidebar}
        aria-label="Close cart sidebar"
      />
      <aside className="cart-sidebar" aria-label="Cart Sidebar">
        <div className="cart-sidebar-head">
          <h3>Your Cart</h3>
          <button type="button" className="cart-sidebar-close" onClick={closeSidebar}>
            x
          </button>
        </div>

        <div className="cart-sidebar-body">
          {cartItems.length === 0 ? (
            <p className="summary-note">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <article key={item.id} className="cart-sidebar-item">
                <div className="cart-sidebar-item-img-wrap">
                  <Image
                    src={item.image || "/products/default-medicine.svg"}
                    alt={item.imageAlt || item.name}
                    width={96}
                    height={64}
                    className="cart-sidebar-item-img"
                  />
                </div>
                <div className="cart-sidebar-item-info">
                  <h4>{item.name}</h4>
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
                </div>
                <button
                  type="button"
                  className="cart-sidebar-remove"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </article>
            ))
          )}
        </div>

        <div className="cart-sidebar-footer">
          <div className="cart-summary-actions">
            <Link href="/cart" className="secondary-btn summary-btn" onClick={closeSidebar}>
              Open Cart
            </Link>
            <Link href="/checkout" className="primary-btn summary-btn" onClick={closeSidebar}>
              Order Now
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

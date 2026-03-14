"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { useCart } from "../context/cart-context";

const WHATSAPP_NUMBER = "919979979688";
const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery (COD)", helper: "Pay when your order arrives" },
];
const ORDER_STORAGE_PREFIX = "Rudraksh_orders_";

export function CheckoutView() {
  const router = useRouter();
  const { user, isHydrated: isAuthHydrated, hasCompletedProfile } = useAuth();
  const { cartItems, itemCount, totalAmount } = useCart();
  const [actionMessage, setActionMessage] = useState("");
  const [paymentMethod] = useState("cod");

  useEffect(() => {
    if (!isAuthHydrated) {
      return;
    }

    if (!user) {
      router.replace("/login?next=/checkout");
      return;
    }

    if (!hasCompletedProfile()) {
      router.replace("/profile?next=/checkout");
    }
  }, [hasCompletedProfile, isAuthHydrated, router, user]);

  const persistOrder = () => {
    if (!user?.id || cartItems.length === 0) {
      return;
    }

    const order = {
      id: `order_${Date.now()}`,
      createdAt: new Date().toISOString(),
      deliveryStatus: "processing",
      deliveredAt: null,
      paymentMethod,
      totalAmount,
      itemCount,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };

    const storageKey = `${ORDER_STORAGE_PREFIX}${user.id}`;
    let existingOrders = [];

    try {
      const raw = window.localStorage.getItem(storageKey);
      existingOrders = raw ? JSON.parse(raw) : [];
    } catch {
      existingOrders = [];
    }

    window.localStorage.setItem(storageKey, JSON.stringify([order, ...existingOrders]));
  };

  const whatsappMessage = useMemo(() => {
    if (!user || cartItems.length === 0) {
      return "";
    }

    const orderDate = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const lines = cartItems.map((item, index) => {
      return [
        `${index + 1}. ${item.name}`,
        `   Qty: ${item.quantity}`,
      ].join("\n");
    });

    return [
      "*New Order Request*",
      "Rudraksh Pharmacy",
      "",
      "Hello Team, I would like to place the following order:",
      "",
      "*Customer Details*",
      `Customer Name: ${user.fullName || user.name}`,
      `Customer Email: ${user.email}`,
      `Delivery Address: ${user.address || "Not provided"}`,
      `Pin Code: ${user.pincode || "Not provided"}`,
      `Order Date: ${orderDate}`,
      "",
      "*Order Items*",
      ...lines,
      "",
      "Please confirm availability and expected delivery time.",
      "Thank you.",
    ].join("\n");
  }, [cartItems, user]);

  const whatsappLink = whatsappMessage
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`
    : "#";

  const handleWhatsAppOrder = () => {
    if (!user) {
      setActionMessage("Please login first to place an order.");
      return;
    }

    if (cartItems.length === 0) {
      setActionMessage("Your cart is empty. Add products first.");
      return;
    }

    setActionMessage("");
    persistOrder();
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  };

  const handleProceedPayment = () => {
    if (!user) {
      setActionMessage("Please login first to continue payment.");
      return;
    }

    if (cartItems.length === 0) {
      setActionMessage("Your cart is empty. Add products first.");
      return;
    }

    setActionMessage("");
    persistOrder();
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  };

  if (!isAuthHydrated || !user) {
    return null;
  }

  return (
    <section className="section container">
      <div className="section-head">
        <h1>Checkout</h1>
        <p>Complete your order with secure and guided checkout flow.</p>
      </div>

      <div className="order-summary">
        <div className="summary-headline">
          <h3>Order Summary</h3>
          <span>Secure Checkout</span>
        </div>
        {cartItems.length === 0 ? (
          <p className="summary-note">Add products to cart to create your order.</p>
        ) : (
          <ul className="summary-list">
            {cartItems.map((item) => (
              <li key={item.id}>
                <span>{item.name} x {item.quantity}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="summary-breakup">
          <p>
            <span>Items</span>
            <strong>{itemCount}</strong>
          </p>
          <p>
            <span>Shipping</span>
            <strong>Free</strong>
          </p>
        </div>
        <div className="payment-section">
          <h4>Select Payment Method</h4>
          <div className="payment-methods">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className={`payment-option ${paymentMethod === method.id ? "active" : ""}`}
              >
                <input type="radio" name="paymentMethod" value={method.id} checked readOnly />
                <span>{method.label}</span>
                <small>{method.helper}</small>
              </label>
            ))}
          </div>
          <div className="delivery-info-note" role="note" aria-label="Delivery information">
            <p>
              <strong>Delivery Info:</strong> Free delivery is available within a 5 km radius.
            </p>
            <p>
              For locations beyond 5 km, please contact the seller to arrange delivery details
              and charges.
            </p>
          </div>
        </div>
        <p className="min-order-note ok">
          For inquiry and quotation, contact us on WhatsApp.
        </p>
        {actionMessage ? <p className="summary-warning">{actionMessage}</p> : null}
        <button type="button" className="primary-btn summary-btn" onClick={handleProceedPayment}>
          Place COD Order
        </button>
        <button type="button" className="secondary-btn summary-btn" onClick={handleWhatsAppOrder}>
          Place Order on WhatsApp
        </button>
      </div>
    </section>
  );
}

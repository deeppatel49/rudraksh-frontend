"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products } from "../data/products";
import { medicines } from "../data/medicines-data";
import { useAuth } from "./auth-context";

const CartContext = createContext(null);
const STORAGE_KEY_PREFIX = "rudraksha_cart_items_";

function getStorageKeyForUser(userId) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

// Combine all products (medicines + regular products)
function getAllProducts() {
  return [...medicines, ...products];
}

function normalizeCartEntry(entry) {
  if (typeof entry === "number") {
    return { quantity: Math.max(0, Math.floor(entry)), product: null };
  }

  if (entry && typeof entry === "object") {
    return {
      quantity: Math.max(0, Math.floor(Number(entry.quantity) || 0)),
      product: entry.product && typeof entry.product === "object" ? entry.product : null,
    };
  }

  return { quantity: 0, product: null };
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsHydrated(false);

    if (!user?.id) {
      setItems({});
      setIsSidebarOpen(false);
      setIsHydrated(true);
      return;
    }

    try {
      const raw = window.localStorage.getItem(getStorageKeyForUser(user.id));
      if (raw) {
        setItems(JSON.parse(raw));
      } else {
        setItems({});
      }
    } catch (error) {
      console.error("Failed to restore cart state:", error);
      setItems({});
    } finally {
      setIsHydrated(true);
    }
  }, [user?.id]);

  const value = useMemo(() => {
    const persistForUser = (nextItems, targetUserId = user?.id) => {
      if (!targetUserId) {
        return;
      }

      window.localStorage.setItem(
        getStorageKeyForUser(targetUserId),
        JSON.stringify(nextItems)
      );

      if (targetUserId === user?.id) {
        setItems(nextItems);
      }
    };

    const addItem = (productId, quantity = 1, targetUserId, productSnapshot = null) => {
      const safeQty = Math.max(1, Math.floor(quantity));

      const activeUserId = targetUserId || user?.id;
      if (!activeUserId) {
        return;
      }

      let baseItems = {};
      try {
        const raw = window.localStorage.getItem(getStorageKeyForUser(activeUserId));
        baseItems = raw ? JSON.parse(raw) : {};
      } catch {
        baseItems = {};
      }

      const existingEntry = normalizeCartEntry(baseItems[productId]);
      persistForUser(
        {
          ...baseItems,
          [productId]: {
            quantity: existingEntry.quantity + safeQty,
            product: productSnapshot || existingEntry.product || null,
          },
        },
        activeUserId
      );
      setIsSidebarOpen(true);
    };

    const updateItemQuantity = (productId, quantity) => {
      if (!user?.id) {
        return;
      }

      const safeQty = Math.max(0, Math.floor(quantity));
      const nextItems = { ...items };
      if (safeQty === 0) {
        delete nextItems[productId];
      } else {
        const existingEntry = normalizeCartEntry(nextItems[productId]);
        nextItems[productId] = {
          quantity: safeQty,
          product: existingEntry.product || null,
        };
      }
      persistForUser(nextItems);
    };

    const removeItem = (productId) => {
      if (!user?.id) {
        return;
      }

      const nextItems = { ...items };
      delete nextItems[productId];
      persistForUser(nextItems);
    };

    const clearCart = () => {
      if (!user?.id) {
        return;
      }

      persistForUser({});
    };

    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);

    const allProductsMap = new Map(getAllProducts().map((product) => [product.id, product]));
    const cartItems = Object.entries(items)
      .map(([productId, rawEntry]) => {
        const entry = normalizeCartEntry(rawEntry);
        if (entry.quantity <= 0) {
          return null;
        }

        const product = entry.product || allProductsMap.get(productId);
        if (!product) {
          return null;
        }

        const safePrice = Number(product.price) || 0;
        return {
          id: productId,
          name: product.name || "Unknown Product",
          price: safePrice,
          image: product.image || "/products/default-medicine.svg",
          quantity: entry.quantity,
          subtotal: safePrice * entry.quantity,
        };
      })
      .filter(Boolean);

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      items,
      cartItems,
      itemCount,
      totalAmount,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      openSidebar,
      closeSidebar,
      isHydrated,
      isSidebarOpen,
    };
  }, [items, isHydrated, isSidebarOpen, user?.id]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}

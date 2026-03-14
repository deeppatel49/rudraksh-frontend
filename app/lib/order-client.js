export const ORDER_STORAGE_PREFIX = "Rudraksh_orders_";

export function readOrdersForUser(userId) {
  if (!userId || typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(`${ORDER_STORAGE_PREFIX}${userId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeOrdersForUser(userId, orders) {
  if (!userId || typeof window === "undefined") {
    return;
  }

  const safeOrders = Array.isArray(orders) ? orders : [];
  window.localStorage.setItem(`${ORDER_STORAGE_PREFIX}${userId}`, JSON.stringify(safeOrders));
}

export function isOrderDelivered(order) {
  return String(order?.deliveryStatus || "").toLowerCase() === "delivered";
}

export function hasDeliveredPurchaseForProduct(userId, productId) {
  if (!userId || !productId) {
    return false;
  }

  const orders = readOrdersForUser(userId);
  return orders.some(
    (order) => isOrderDelivered(order)
      && Array.isArray(order?.items)
      && order.items.some((item) => item.id === productId)
  );
}

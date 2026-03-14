import {
  listOrders,
  getOrderById,
  listOrdersByUserId,
  createOrder,
  updateOrderStatus,
} from "../repositories/orders.repository.js";

/**
 * Normalize order data for API responses
 */
function normalizeOrder(row) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    totalAmount: Number(row.totalAmount) || 0,
    itemCount: Number(row.itemCount) || 0,
    items: Array.isArray(row.items) ? row.items : [],
    deliveryStatus: String(row.deliveryStatus || "pending").toLowerCase(),
    currency: row.currency || "INR",
    notes: row.notes || "",
  };
}

/**
 * Fetch orders for admin dashboard
 */
export async function fetchOrders(params = {}) {
  const limit = Math.max(1, Math.min(100, Number(params.limit) || 50));
  const offset = Math.max(0, Number(params.offset) || 0);
  const status = params.status || null;

  const result = await listOrders({ limit, offset, status });

  return {
    orders: result.rows.map(normalizeOrder),
    pagination: {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
    },
  };
}

/**
 * Fetch a single order by ID
 */
export async function fetchOrderById(orderId) {
  const row = await getOrderById(orderId);
  return row ? normalizeOrder(row) : null;
}

/**
 * Fetch user's orders
 */
export async function fetchUserOrders(userId, params = {}) {
  const limit = Math.max(1, Math.min(50, Number(params.limit) || 20));
  const offset = Math.max(0, Number(params.offset) || 0);

  const result = await listOrdersByUserId(userId, { limit, offset });

  return {
    orders: result.rows.map(normalizeOrder),
    pagination: {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
    },
  };
}

/**
 * Create a new order
 */
export async function saveOrder(orderData) {
  const row = await createOrder(orderData);
  return row ? normalizeOrder(row) : null;
}

/**
 * Update order delivery status
 */
export async function updateOrder(orderId, status) {
  const row = await updateOrderStatus(orderId, status);
  return row ? normalizeOrder(row) : null;
}

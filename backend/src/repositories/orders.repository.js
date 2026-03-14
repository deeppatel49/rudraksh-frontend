import { getSupabaseClient } from "../config/supabase.js";

/**
 * Fetch all orders with optional pagination and filters
 */
export async function listOrders({ limit = 100, offset = 0, status = null } = {}) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { rows: [], total: 0, limit, offset };
  }

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("createdAt", { ascending: false });

  // Filter by status if provided
  if (status && String(status).toLowerCase() !== "all") {
    query = query.eq("deliveryStatus", String(status).trim());
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Supabase error fetching orders:", error);
    return { rows: [], total: 0, limit, offset };
  }

  return {
    rows: Array.isArray(data) ? data : [],
    total: Number(count) || 0,
    limit,
    offset,
  };
}

/**
 * Fetch a single order by ID
 */
export async function getOrderById(orderId) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", String(orderId).trim())
    .maybeSingle();

  if (error) {
    console.error("Supabase error fetching order:", error);
    return null;
  }

  return data || null;
}

/**
 * Fetch orders for a specific user
 */
export async function listOrdersByUserId(userId, { limit = 50, offset = 0 } = {}) {
  const supabase = getSupabaseClient();

  if (!supabase || !userId) {
    return { rows: [], total: 0, limit, offset };
  }

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("userId", String(userId).trim())
    .order("createdAt", { ascending: false });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Supabase error fetching user orders:", error);
    return { rows: [], total: 0, limit, offset };
  }

  return {
    rows: Array.isArray(data) ? data : [],
    total: Number(count) || 0,
    limit,
    offset,
  };
}

/**
 * Create a new order
 */
export async function createOrder(orderData) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (error) {
    console.error("Supabase error creating order:", error);
    return null;
  }

  return data || null;
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, deliveryStatus) {
  const supabase = getSupabaseClient();

  if (!supabase || !orderId) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ deliveryStatus: String(deliveryStatus).trim(), updatedAt: new Date().toISOString() })
    .eq("id", String(orderId).trim())
    .select()
    .maybeSingle();

  if (error) {
    console.error("Supabase error updating order:", error);
    return null;
  }

  return data || null;
}

import { fetchOrders, fetchOrderById, fetchUserOrders } from "../services/orders.service.js";
import { notFound, ok } from "../utils/http.js";

export async function getOrders(req, res, next) {
  try {
    const payload = await fetchOrders({
      limit: req.query.limit || 50,
      offset: req.query.offset || 0,
      status: req.query.status || null,
    });

    return ok(res, payload);
  } catch (error) {
    return next(error);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await fetchOrderById(req.params.id);
    if (!order) {
      return notFound(res, "Order not found.");
    }

    return ok(res, { order });
  } catch (error) {
    return next(error);
  }
}

export async function getUserOrders(req, res, next) {
  try {
    const userId = req.params.userId || req.user?.id;
    if (!userId) {
      return notFound(res, "User ID is required.");
    }

    const payload = await fetchUserOrders(userId, {
      limit: req.query.limit || 20,
      offset: req.query.offset || 0,
    });

    return ok(res, payload);
  } catch (error) {
    return next(error);
  }
}

import { fetchDashboardSummary } from "../services/dashboard.service.js";
import { ok } from "../utils/http.js";

export async function getDashboardSummary(req, res, next) {
  try {
    const payload = await fetchDashboardSummary();

    return ok(res, {
      admin: req.adminUser,
      ...payload,
    });
  } catch (error) {
    return next(error);
  }
}

import { serverError } from "../utils/http.js";

export function errorHandler(err, _req, res, _next) {
  console.error("[backend-error]", err);
  return serverError(res, err?.message || "Internal server error.");
}

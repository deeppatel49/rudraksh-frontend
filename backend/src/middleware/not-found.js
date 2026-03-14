import { notFound } from "../utils/http.js";

export function notFoundHandler(_req, res) {
  return notFound(res, "API route not found.");
}

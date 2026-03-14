import { fetchProductById, fetchProducts } from "../services/products.service.js";
import { notFound, ok } from "../utils/http.js";

export async function getProducts(req, res, next) {
  try {
    const includeTotal = ["1", "true", "yes"].includes(
      String(req.query.includeTotal || "").toLowerCase()
    );

    const payload = await fetchProducts({
      category: req.query.cat || req.query.category || "All",
      query: req.query.q || "",
      page: req.query.page || 1,
      limit: req.query.limit || 50,
      includeTotal,
    });

    return ok(res, payload);
  } catch (error) {
    return next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await fetchProductById(req.params.id);
    if (!product) {
      return notFound(res, "Product not found.");
    }

    return ok(res, { product });
  } catch (error) {
    return next(error);
  }
}

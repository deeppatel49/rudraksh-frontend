import { getCachedMedicines } from "../../data/medicines";
import { products as otherProducts } from "../../data/products";

function matchesCategory(product, category) {
  if (!category || String(category).toLowerCase() === "all") {
    return true;
  }

  return String(product.category || "").toLowerCase() === String(category).toLowerCase();
}

function matchesQuery(product, query) {
  if (!query) {
    return true;
  }

  const q = String(query).toLowerCase();
  return `${product.name} ${product.description} ${product.category} ${product.manufacturer || ""}`
    .toLowerCase()
    .includes(q);
}

export async function getMedicinesCatalog({ category = "All", query = "", page = 1, limit = 50 } = {}) {
  const allProducts = [...getCachedMedicines(), ...otherProducts];
  const filtered = allProducts.filter(
    (item) => matchesCategory(item, category) && matchesQuery(item, query)
  );

  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 50));
  const safePage = Math.max(1, Number(page) || 1);
  const start = (safePage - 1) * safeLimit;

  return {
    products: filtered.slice(start, start + safeLimit),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / safeLimit)),
    },
  };
}

import { getSupabaseClient } from "../config/supabase.js";

const PRODUCT_COLUMNS = "SrNo, Item_Name, Company, Generic, ItemType, Category, Pack, Mrp";
const UPDATABLE_PRODUCT_COLUMNS = ["Item_Name", "Company", "Generic", "ItemType", "Category", "Pack", "Mrp"];

function normalizeProductId(productId) {
  const raw = String(productId ?? "").trim().toLowerCase();

  if (!raw || raw === "undefined" || raw === "null") {
    return null;
  }

  const numericId = Number(raw);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  return numericId;
}

export async function listProducts({ category, query, page = 1, limit = 50, includeTotal = false }) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 50));
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let request = supabase
    .from("products")
    .select(PRODUCT_COLUMNS, includeTotal ? { count: "exact" } : undefined)
    .order("SrNo", { ascending: true })
    .range(from, to);

  if (category && String(category).toLowerCase() !== "all") {
    request = request.eq("Category", String(category).trim());
  }

  if (query && String(query).trim()) {
    const q = String(query).trim().replace(/%/g, "\\%").replace(/_/g, "\\_");
    request = request.or(`Item_Name.ilike.%${q}%,Generic.ilike.%${q}%,Company.ilike.%${q}%,Category.ilike.%${q}%`);
  }

  const { data, error, count } = await request;
  if (error) {
    throw new Error(error.message || "Unable to fetch products.");
  }

  return {
    rows: Array.isArray(data) ? data : [],
    total: includeTotal ? Number(count) || 0 : null,
    page: safePage,
    limit: safeLimit,
  };
}

export async function getProductById(productId) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const normalizedProductId = normalizeProductId(productId);
  if (normalizedProductId === null) {
    return null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("SrNo", normalizedProductId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message || "Unable to fetch product.");
  }

  return data || null;
}

export async function updateProductById(productId, updates) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const normalizedProductId = normalizeProductId(productId);
  if (normalizedProductId === null) {
    throw new Error("Invalid product ID.");
  }

  const safeUpdates = Object.fromEntries(
    Object.entries(updates || {}).filter(([key, value]) =>
      UPDATABLE_PRODUCT_COLUMNS.includes(key) && value !== undefined
    )
  );

  if (Object.keys(safeUpdates).length === 0) {
    throw new Error("No product changes supplied.");
  }

  const { data, error } = await supabase
    .from("products")
    .update(safeUpdates)
    .eq("SrNo", normalizedProductId)
    .select(PRODUCT_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to update product.");
  }

  return data || null;
}

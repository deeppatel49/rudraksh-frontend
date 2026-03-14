import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL. Supabase features may not work."
  );
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY. Supabase features may not work."
  );
}

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase is not properly configured for the frontend.");
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Transform Supabase product data to frontend format
 */
function transformProduct(product) {
  if (!product) return null;

  return {
    id: product.SrNo,
    srNo: product.SrNo,
    name: product.Item_Name,
    itemName: product.Item_Name,
    company: product.Company,
    manufacturer: product.Company,
    generic: product.Generic,
    itemType: product.ItemType,
    category: product.Category,
    pack: product.Pack,
    price: parseFloat(product.Mrp) || 0,
    mrp: parseFloat(product.Mrp) || 0
  };
}

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

/**
 * Fetch paginated products with filtering and search
 */
export async function fetchProducts({ page = 1, limit = 100, category = null, query = null } = {}) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(500, Number(limit) || 100));
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  // Select all columns from schema: SrNo, Item_Name, Company, Generic, ItemType, Category, Pack, Mrp
  const columnsToSelect = 'SrNo, Item_Name, Company, Generic, ItemType, Category, Pack, Mrp';

  // Build query with proper order: select -> filters -> order -> range
  let request = supabase
    .from("products")
    .select(columnsToSelect, { count: "exact" });

  // Apply category filter if provided
  if (category && String(category).toLowerCase() !== "all") {
    request = request.eq("Category", String(category).trim());
  }

  // Apply text search if query is provided
  if (query && String(query).trim()) {
    const q = String(query).trim();
    const escapedQ = q.replace(/%/g, '\\%').replace(/_/g, '\\_');
    request = request.or(`Item_Name.ilike.%${escapedQ}%,Generic.ilike.%${escapedQ}%,Company.ilike.%${escapedQ}%,Category.ilike.%${escapedQ}%`);
  }

  // Apply ordering before range (this is the correct Supabase order)
  request = request.order('SrNo', { ascending: true });

  // Apply pagination range
  request = request.range(from, to);

  const { data, error, count } = await request;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "Unable to fetch products from database.");
  }

  // Transform all products
  const transformedProducts = Array.isArray(data) ? data.map(transformProduct) : [];

  return {
    products: transformedProducts,
    total: Number(count) || 0,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil((Number(count) || 0) / safeLimit)),
  };
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(productId) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const normalizedProductId = normalizeProductId(productId);
  if (normalizedProductId === null) {
    throw new Error("Invalid product ID.");
  }

  // Use actual column names from schema: SrNo, Item_Name, Company, Generic, ItemType, Category, Pack, Mrp
  const { data, error } = await supabase
    .from("products")
    .select('SrNo, Item_Name, Company, Generic, ItemType, Category, Pack, Mrp')
    .eq("SrNo", normalizedProductId)
    .maybeSingle();

  if (error) {
    console.error("Supabase error fetching product:", error);
    throw new Error(error.message || "Unable to fetch product.");
  }

  if (!data) {
    return null;
  }

  return transformProduct(data);
}

/**
 * Fetch multiple products by IDs
 */
export async function fetchProductsByIds(productIds) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return [];
  }

  const normalizedProductIds = productIds
    .map(normalizeProductId)
    .filter((id) => id !== null);

  if (normalizedProductIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select('SrNo, Item_Name, Company, Generic, ItemType, Category, Pack, Mrp')
    .in("SrNo", normalizedProductIds);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "Unable to fetch products.");
  }

  return Array.isArray(data) ? data.map(transformProduct) : [];
}

/**
 * Fetch featured/recommended products
 */
export async function fetchFeaturedProducts(limit = 10) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("products")
    .select('SrNo, Item_Name, Company, Generic, ItemType, Category, Pack, Mrp')
    .order('SrNo', { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "Unable to fetch featured products.");
  }

  return Array.isArray(data) ? data.map(transformProduct) : [];
}

/**
 * Search products with advanced text search
 */
export async function searchProducts(searchTerm, options = {}) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { limit = 50, offset = 0 } = options;
  const term = String(searchTerm || '').trim();

  if (!term) {
    return { products: [], total: 0 };
  }

  const escapedTerm = term.replace(/%/g, '\\%').replace(/_/g, '\\_');

  const { data, error, count } = await supabase
    .from("products")
    .select('SrNo, Item_Name, Company, Generic, ItemType, Category, Pack, Mrp', { count: "exact" })
    .ilike("Item_Name", `%${escapedTerm}%`)
    .order('SrNo', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "Unable to search products.");
  }

  return {
    products: Array.isArray(data) ? data.map(transformProduct) : [],
    total: Number(count) || 0
  };
}

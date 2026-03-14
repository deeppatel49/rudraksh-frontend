import { getSupabaseClient } from "../config/supabase.js";

export async function listRecentReviews(limit = 20) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error(error.message || "Unable to fetch reviews.");
  }

  return Array.isArray(data) ? data : [];
}

export async function listReviewsByProductId(productId) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Unable to fetch reviews.");
  }

  return Array.isArray(data) ? data : [];
}

export async function createReview(input) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert([input])
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Unable to create review.");
  }

  return data;
}

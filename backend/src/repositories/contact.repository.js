import { getSupabaseClient } from "../config/supabase.js";

export async function listContactSubmissions(limit = 20) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));

  const { data, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error(error.message || "Unable to fetch contact submissions.");
  }

  return Array.isArray(data) ? data : [];
}

export async function createContactSubmission(input) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("contact_submissions")
    .insert([input])
    .select("id, created_at")
    .single();

  if (error) {
    throw new Error(error.message || "Unable to store contact submission.");
  }

  return data;
}

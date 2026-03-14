import { getSupabaseClient } from "../config/supabase.js";

function requireSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

function mapProfileRepositoryError(error, fallbackMessage) {
  const message = String(error?.message || fallbackMessage);

  if (message.includes("Could not find the table 'public.admin_user_profiles'")) {
    throw new Error(
      "Admin profile table is missing. Run backend/supabase/schema.sql in your Supabase SQL editor, then restart the backend."
    );
  }

  throw new Error(message || fallbackMessage);
}

export async function getAdminProfileByUserId(userId) {
  const supabase = requireSupabase();

  const { data, error } = await withTimeout(
    supabase
      .from("admin_user_profiles")
      .select("id, user_id, full_name, mobile_number, gender, address, city, pincode, updated_at")
      .eq("user_id", userId)
      .maybeSingle(),
    8000,
    "Timed out while fetching profile."
  );

  if (error && error.code !== "PGRST116") {
    mapProfileRepositoryError(error, "Unable to fetch profile.");
  }

  return data || null;
}

export async function upsertAdminProfileByUserId(userId, payload) {
  const supabase = requireSupabase();

  const upsertPayload = {
    user_id: userId,
    full_name: payload.full_name,
    mobile_number: payload.mobile_number,
    gender: payload.gender,
    address: payload.address,
    city: payload.city,
    pincode: payload.pincode,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await withTimeout(
    supabase
      .from("admin_user_profiles")
      .upsert(upsertPayload, { onConflict: "user_id" })
      .select("id, user_id, full_name, mobile_number, gender, address, city, pincode, updated_at")
      .single(),
    8000,
    "Timed out while saving profile."
  );

  if (error) {
    mapProfileRepositoryError(error, "Unable to save profile.");
  }

  return data;
}

export async function listRecentAdminSessionsByUserId(userId, limit = 5) {
  const supabase = requireSupabase();
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || 5));

  const { data, error } = await withTimeout(
    supabase
      .from("admin_sessions")
      .select("id, created_at, last_seen_at, expires_at, user_agent, ip_address")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(safeLimit),
    8000,
    "Timed out while fetching login sessions."
  );

  if (error) {
    mapProfileRepositoryError(error, "Unable to fetch login sessions.");
  }

  return Array.isArray(data) ? data : [];
}

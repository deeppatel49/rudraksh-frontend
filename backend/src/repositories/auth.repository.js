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

function mapAuthRepositoryError(error, fallbackMessage) {
  const message = String(error?.message || fallbackMessage);

  if (message.includes("Could not find the table 'public.admin_users'")) {
    throw new Error(
      "Admin authentication tables are missing. Run backend/supabase/schema.sql in your Supabase SQL editor, then restart the backend."
    );
  }

  if (message.includes("Could not find the table 'public.admin_sessions'")) {
    throw new Error(
      "Admin session tables are missing. Run backend/supabase/schema.sql in your Supabase SQL editor, then restart the backend."
    );
  }

  throw new Error(message || fallbackMessage);
}

export async function getAdminUserByEmail(email) {
  const supabase = requireSupabase();

  const { data, error } = await withTimeout(
    supabase
      .from("admin_users")
      .select("id, full_name, email, password_hash, password_salt, is_active, created_at")
      .eq("email", String(email).toLowerCase())
      .maybeSingle(),
    8000,
    "Timed out while fetching admin user."
  );

  if (error && error.code !== "PGRST116") {
    mapAuthRepositoryError(error, "Unable to fetch user.");
  }

  return data || null;
}

export async function getAdminUserCount() {
  const supabase = requireSupabase();

  const { count, error } = await withTimeout(
    supabase
      .from("admin_users")
      .select("id", { count: "exact", head: true }),
    8000,
    "Timed out while counting admin users."
  );

  if (error) {
    mapAuthRepositoryError(error, "Unable to count admin users.");
  }

  return Number(count || 0);
}

export async function getAdminUserById(userId) {
  const supabase = requireSupabase();

  const { data, error } = await withTimeout(
    supabase
      .from("admin_users")
      .select("id, full_name, email, is_active, created_at")
      .eq("id", userId)
      .maybeSingle(),
    8000,
    "Timed out while fetching admin user."
  );

  if (error && error.code !== "PGRST116") {
    mapAuthRepositoryError(error, "Unable to fetch user.");
  }

  return data || null;
}

export async function getAdminUserAuthById(userId) {
  const supabase = requireSupabase();

  const { data, error } = await withTimeout(
    supabase
      .from("admin_users")
      .select("id, full_name, email, password_hash, password_salt, is_active, created_at")
      .eq("id", userId)
      .maybeSingle(),
    8000,
    "Timed out while fetching admin user."
  );

  if (error && error.code !== "PGRST116") {
    mapAuthRepositoryError(error, "Unable to fetch user.");
  }

  return data || null;
}

export async function createAdminUser(payload) {
  const supabase = requireSupabase();

  const { data, error } = await withTimeout(
    supabase
      .from("admin_users")
      .insert(payload)
      .select("id, full_name, email, is_active, created_at")
      .single(),
    8000,
    "Timed out while creating admin user."
  );

  if (error) {
    mapAuthRepositoryError(error, "Unable to create user.");
  }

  return data;
}

export async function updateAdminUserById(userId, payload) {
  const supabase = requireSupabase();

  const { data, error } = await withTimeout(
    supabase
      .from("admin_users")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("id, full_name, email, is_active, created_at")
      .maybeSingle(),
    8000,
    "Timed out while updating admin user."
  );

  if (error) {
    mapAuthRepositoryError(error, "Unable to update admin user.");
  }

  return data || null;
}

export async function createAdminSession(payload) {
  const supabase = requireSupabase();

  const { data, error } = await withTimeout(
    supabase
      .from("admin_sessions")
      .insert(payload)
      .select("id, user_id, expires_at")
      .single(),
    8000,
    "Timed out while creating admin session."
  );

  if (error) {
    mapAuthRepositoryError(error, "Unable to create session.");
  }

  return data;
}

export async function getSessionWithUserByTokenHash(tokenHash) {
  const supabase = requireSupabase();

  const { data, error } = await withTimeout(
    supabase
      .from("admin_sessions")
      .select("id, user_id, expires_at, admin_users (id, full_name, email, is_active, created_at)")
      .eq("token_hash", tokenHash)
      .maybeSingle(),
    8000,
    "Timed out while fetching admin session."
  );

  if (error && error.code !== "PGRST116") {
    mapAuthRepositoryError(error, "Unable to fetch session.");
  }

  return data || null;
}

export async function deleteSessionByTokenHash(tokenHash) {
  const supabase = requireSupabase();

  const { error } = await withTimeout(
    supabase
      .from("admin_sessions")
      .delete()
      .eq("token_hash", tokenHash),
    8000,
    "Timed out while deleting admin session."
  );

  if (error) {
    mapAuthRepositoryError(error, "Unable to delete session.");
  }
}

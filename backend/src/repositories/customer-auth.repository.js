import { getSupabaseClient } from "../config/supabase.js";

const PHONE_EMAIL_SUFFIX = "@rudraksha.local";

function requireSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

function sanitize(value, fallback = "") {
  const safe = String(value || "").trim();
  return safe || fallback;
}

function normalizeEmail(value) {
  return sanitize(value).toLowerCase();
}

function normalizeDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim().toLowerCase());
}

function normalizeIdentifier(identifier) {
  const raw = sanitize(identifier);
  if (!raw) {
    return null;
  }

  if (looksLikeEmail(raw)) {
    return {
      type: "email",
      email: normalizeEmail(raw),
      phone: "",
    };
  }

  const phoneDigits = normalizeDigits(raw);
  if (phoneDigits.length >= 10 && phoneDigits.length <= 15) {
    return {
      type: "phone",
      email: `phone${phoneDigits}${PHONE_EMAIL_SUFFIX}`,
      phone: phoneDigits,
    };
  }

  return null;
}

function mapRepositoryError(error, fallbackMessage) {
  const message = String(error?.message || fallbackMessage);

  if (message.includes("public.customer_auth_accounts")) {
    throw new Error(
      "Customer auth table is missing. Run backend/supabase/schema.sql in your Supabase SQL editor, then restart the backend."
    );
  }

  if (message.includes("public.customer_profiles")) {
    throw new Error(
      "Customer profiles table is missing. Run backend/supabase/schema.sql in your Supabase SQL editor, then restart the backend."
    );
  }

  if (message.includes("public.customer_login_activities")) {
    throw new Error(
      "Customer login activity table is missing. Run backend/supabase/schema.sql in your Supabase SQL editor, then restart the backend."
    );
  }

  throw new Error(message || fallbackMessage);
}

function toAccountModel(row = {}) {
  return {
    id: sanitize(row.id),
    userId: sanitize(row.user_id),
    fullName: sanitize(row.full_name, "Customer"),
    email: normalizeEmail(row.email),
    phone: sanitize(row.phone),
    passwordHash: sanitize(row.password_hash),
    passwordSalt: sanitize(row.password_salt),
    provider: sanitize(row.provider, "manual"),
    isActive: Boolean(row.is_active),
    createdAt: sanitize(row.created_at),
    updatedAt: sanitize(row.updated_at),
  };
}

function toProfileModel(row = {}) {
  return {
    id: sanitize(row.id),
    userId: sanitize(row.user_id),
    fullName: sanitize(row.full_name),
    gender: sanitize(row.gender),
    mobileNumber: sanitize(row.mobile_number),
    whatsappNumber: sanitize(row.whatsapp_number),
    email: normalizeEmail(row.email),
    address: sanitize(row.address),
    city: sanitize(row.city),
    pincode: sanitize(row.pincode),
    createdAt: sanitize(row.created_at),
    updatedAt: sanitize(row.updated_at),
  };
}

function toActivityModel(row = {}) {
  return {
    id: sanitize(row.id),
    userId: sanitize(row.user_id),
    loginMethod: sanitize(row.login_method, "manual"),
    name: sanitize(row.name, "Customer"),
    email: normalizeEmail(row.email),
    identifier: sanitize(row.identifier),
    phone: sanitize(row.phone),
    address: sanitize(row.address),
    city: sanitize(row.city),
    pincode: sanitize(row.pincode),
    imageUrl: sanitize(row.image_url, "/rudraksha-logo-v2.png"),
    providerImageUrl: sanitize(row.provider_image_url, "/rudraksha-logo.png"),
    userAgent: sanitize(row.user_agent),
    ipAddress: sanitize(row.ip_address),
    loggedInAt: sanitize(row.logged_in_at, row.updated_at || new Date().toISOString()),
  };
}

export function resolveIdentifier(identifier) {
  return normalizeIdentifier(identifier);
}

export function createUserId(email) {
  return `user_${normalizeEmail(email)}`;
}

export async function getCustomerAccountByUserId(userId) {
  const safeUserId = sanitize(userId);
  if (!safeUserId) {
    return null;
  }

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("customer_auth_accounts")
    .select("id, user_id, full_name, email, phone, password_hash, password_salt, provider, is_active, created_at, updated_at")
    .eq("user_id", safeUserId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    mapRepositoryError(error, "Unable to fetch customer account.");
  }

  return data ? toAccountModel(data) : null;
}

export async function getCustomerAccountByEmail(email) {
  const safeEmail = normalizeEmail(email);
  if (!safeEmail) {
    return null;
  }

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("customer_auth_accounts")
    .select("id, user_id, full_name, email, phone, password_hash, password_salt, provider, is_active, created_at, updated_at")
    .eq("email", safeEmail)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    mapRepositoryError(error, "Unable to fetch customer account.");
  }

  return data ? toAccountModel(data) : null;
}

export async function getCustomerAccountByIdentifier(identifier) {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) {
    return null;
  }

  if (normalized.type === "email") {
    return getCustomerAccountByEmail(normalized.email);
  }

  const supabase = requireSupabase();

  const byPhone = await supabase
    .from("customer_auth_accounts")
    .select("id, user_id, full_name, email, phone, password_hash, password_salt, provider, is_active, created_at, updated_at")
    .eq("phone", normalized.phone)
    .maybeSingle();

  if (byPhone.error && byPhone.error.code !== "PGRST116") {
    mapRepositoryError(byPhone.error, "Unable to fetch customer account.");
  }

  if (byPhone.data) {
    return toAccountModel(byPhone.data);
  }

  const profileQuery = await supabase
    .from("customer_profiles")
    .select("user_id")
    .or(`mobile_number.eq.${normalized.phone},whatsapp_number.eq.${normalized.phone}`)
    .limit(1)
    .maybeSingle();

  if (profileQuery.error && profileQuery.error.code !== "PGRST116") {
    mapRepositoryError(profileQuery.error, "Unable to resolve customer profile.");
  }

  if (!profileQuery.data?.user_id) {
    return null;
  }

  return getCustomerAccountByUserId(profileQuery.data.user_id);
}

export async function createCustomerAccount(payload) {
  const supabase = requireSupabase();
  const row = {
    user_id: sanitize(payload.userId),
    full_name: sanitize(payload.fullName, "Customer"),
    email: normalizeEmail(payload.email),
    phone: sanitize(payload.phone) || null,
    password_hash: sanitize(payload.passwordHash) || null,
    password_salt: sanitize(payload.passwordSalt) || null,
    provider: sanitize(payload.provider, "manual"),
    is_active: payload.isActive !== false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("customer_auth_accounts")
    .insert(row)
    .select("id, user_id, full_name, email, phone, password_hash, password_salt, provider, is_active, created_at, updated_at")
    .single();

  if (error) {
    mapRepositoryError(error, "Unable to create customer account.");
  }

  return toAccountModel(data);
}

export async function updateCustomerAccountByUserId(userId, payload = {}) {
  const safeUserId = sanitize(userId);
  if (!safeUserId) {
    throw new Error("userId is required.");
  }

  const updates = {
    updated_at: new Date().toISOString(),
  };

  if (Object.prototype.hasOwnProperty.call(payload, "fullName")) {
    updates.full_name = sanitize(payload.fullName, "Customer");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "email")) {
    updates.email = normalizeEmail(payload.email);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "phone")) {
    updates.phone = sanitize(payload.phone) || null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "provider")) {
    updates.provider = sanitize(payload.provider, "manual");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "passwordHash")) {
    updates.password_hash = sanitize(payload.passwordHash) || null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "passwordSalt")) {
    updates.password_salt = sanitize(payload.passwordSalt) || null;
  }

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("customer_auth_accounts")
    .update(updates)
    .eq("user_id", safeUserId)
    .select("id, user_id, full_name, email, phone, password_hash, password_salt, provider, is_active, created_at, updated_at")
    .maybeSingle();

  if (error) {
    mapRepositoryError(error, "Unable to update customer account.");
  }

  return data ? toAccountModel(data) : null;
}

export async function readCustomerProfileByUserId(userId) {
  const safeUserId = sanitize(userId);
  if (!safeUserId) {
    return null;
  }

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("customer_profiles")
    .select("id, user_id, full_name, gender, mobile_number, whatsapp_number, email, address, city, pincode, created_at, updated_at")
    .eq("user_id", safeUserId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    mapRepositoryError(error, "Unable to fetch customer profile.");
  }

  return data ? toProfileModel(data) : null;
}

export async function readCustomerProfiles(filters = {}) {
  const supabase = requireSupabase();
  let query = supabase
    .from("customer_profiles")
    .select("id, user_id, full_name, gender, mobile_number, whatsapp_number, email, address, city, pincode, created_at, updated_at")
    .order("updated_at", { ascending: false });

  const safeUserId = sanitize(filters.userId);
  if (safeUserId) {
    query = query.eq("user_id", safeUserId);
  }

  const { data, error } = await query;
  if (error) {
    mapRepositoryError(error, "Unable to load customer profiles.");
  }

  return (Array.isArray(data) ? data : []).map(toProfileModel);
}

export async function upsertCustomerProfile(profile = {}) {
  const safeUserId = sanitize(profile.userId);
  if (!safeUserId) {
    throw new Error("userId is required.");
  }

  const supabase = requireSupabase();
  const payload = {
    user_id: safeUserId,
    full_name: sanitize(profile.fullName) || null,
    gender: sanitize(profile.gender) || null,
    mobile_number: sanitize(profile.mobileNumber) || null,
    whatsapp_number: sanitize(profile.whatsappNumber) || null,
    email: normalizeEmail(profile.email) || null,
    address: sanitize(profile.address) || null,
    city: sanitize(profile.city) || null,
    pincode: sanitize(profile.pincode) || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("customer_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("id, user_id, full_name, gender, mobile_number, whatsapp_number, email, address, city, pincode, created_at, updated_at")
    .single();

  if (error) {
    mapRepositoryError(error, "Unable to save customer profile.");
  }

  return toProfileModel(data);
}

export async function readLoginActivities(filters = {}) {
  const supabase = requireSupabase();
  let query = supabase
    .from("customer_login_activities")
    .select("id, user_id, login_method, name, email, identifier, phone, address, city, pincode, image_url, provider_image_url, user_agent, ip_address, logged_in_at, updated_at")
    .order("logged_in_at", { ascending: false })
    .limit(Math.max(1, Math.min(500, Number(filters.limit) || 500)));

  const safeUserId = sanitize(filters.userId);
  if (safeUserId) {
    query = query.eq("user_id", safeUserId);
  }

  const { data, error } = await query;
  if (error) {
    mapRepositoryError(error, "Unable to load login activities.");
  }

  return (Array.isArray(data) ? data : []).map(toActivityModel);
}

export async function appendLoginActivity(activity = {}) {
  const safeUserId = sanitize(activity.userId);
  if (!safeUserId) {
    throw new Error("userId is required.");
  }

  const safeEmail = normalizeEmail(activity.email);
  const safeNow = new Date().toISOString();
  const supabase = requireSupabase();
  const payload = {
    user_id: safeUserId,
    login_method: sanitize(activity.loginMethod, "manual") === "google" ? "google" : "manual",
    name: sanitize(activity.name, "Customer") || null,
    email: safeEmail || null,
    identifier: sanitize(activity.identifier) || null,
    phone: sanitize(activity.phone) || null,
    address: sanitize(activity.address) || null,
    city: sanitize(activity.city) || null,
    pincode: sanitize(activity.pincode) || null,
    image_url: sanitize(activity.imageUrl, "/rudraksha-logo-v2.png"),
    provider_image_url: sanitize(activity.providerImageUrl, "/rudraksha-logo.png"),
    user_agent: sanitize(activity.userAgent) || null,
    ip_address: sanitize(activity.ipAddress) || null,
    logged_in_at: safeNow,
    updated_at: safeNow,
  };

  const { data, error } = await supabase
    .from("customer_login_activities")
    .upsert(payload, { onConflict: "user_id" })
    .select("id, user_id, login_method, name, email, identifier, phone, address, city, pincode, image_url, provider_image_url, user_agent, ip_address, logged_in_at, updated_at")
    .single();

  if (error) {
    mapRepositoryError(error, "Unable to save login activity.");
  }

  return toActivityModel(data);
}

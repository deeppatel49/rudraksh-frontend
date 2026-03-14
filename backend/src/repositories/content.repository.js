import { getSupabaseClient } from "../config/supabase.js";

function getClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

function isMissingRowError(error) {
  return error && error.code === "PGRST116";
}

async function getSingleRecord(tableName) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .maybeSingle();

  if (error && !isMissingRowError(error)) {
    throw new Error(error.message || `Unable to fetch content from ${tableName}.`);
  }

  return data || null;
}

async function upsertSingleRecord(tableName, payload) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from(tableName)
    .upsert(
      {
        id: 1,
        ...payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || `Unable to save content to ${tableName}.`);
  }

  return data;
}

export async function getLegacyPageContentBySlug(slug) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("page_content")
    .select("slug, title, description, sections, seo_meta")
    .eq("slug", slug)
    .maybeSingle();

  if (error && !isMissingRowError(error)) {
    throw new Error(error.message || "Unable to fetch legacy page content.");
  }

  return data || null;
}

export function getHomeContentRecord() {
  return getSingleRecord("home_content");
}

export function getAboutContentRecord() {
  return getSingleRecord("about_content");
}

export function upsertHomeContentRecord(payload) {
  return upsertSingleRecord("home_content", payload);
}

export function upsertAboutContentRecord(payload) {
  return upsertSingleRecord("about_content", payload);
}

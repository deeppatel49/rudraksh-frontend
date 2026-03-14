import { getSupabaseClient } from "../config/supabase.js";

export async function uploadBanner({ title, description, fileUrl, fileType, fileSize, mimeType }) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("banners")
    .insert({
      title,
      description,
      file_url: fileUrl,
      file_type: fileType, // 'image' or 'video'
      file_size: fileSize,
      mime_type: mimeType,
      is_active: true,
    })
    .select();

  if (error) {
    throw new Error(error.message || "Failed to save banner to database.");
  }

  return data[0];
}

export async function getBanners() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to fetch banners.");
  }

  return data || [];
}

export async function deleteBanner(bannerId) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("banners")
    .delete()
    .eq("id", bannerId);

  if (error) {
    throw new Error(error.message || "Failed to delete banner.");
  }

  return true;
}

export async function updateBannerStatus(bannerId, isActive) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("banners")
    .update({ is_active: isActive })
    .eq("id", bannerId);

  if (error) {
    throw new Error(error.message || "Failed to update banner status.");
  }

  return true;
}

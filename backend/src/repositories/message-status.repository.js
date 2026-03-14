import { getSupabaseClient } from "../config/supabase.js";

const TABLE_NAME = "message_statuses";

function requireSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

function normalizeMessageId(id) {
  return String(id || "").trim();
}

function normalizeStatus(status) {
  return String(status || "").trim() === "read" ? "read" : "not-read";
}

function normalizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return metadata;
}

function normalizeSource(source) {
  const safeSource = String(source || "").trim();
  return safeSource || "contact_submissions";
}

export async function getMessageStatuses(ids = []) {
  const supabase = requireSupabase();
  const safeIds = ids
    .map((id) => normalizeMessageId(id))
    .filter(Boolean);
  const statusMap = {};

  for (const safeId of safeIds) {
    statusMap[safeId] = "not-read";
  }

  if (!safeIds.length) {
    return statusMap;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("message_id, status")
    .in("message_id", safeIds);

  if (error) {
    throw new Error(error.message || "Unable to fetch message statuses.");
  }

  for (const row of Array.isArray(data) ? data : []) {
    const safeId = normalizeMessageId(row?.message_id);
    if (!safeId) continue;
    statusMap[safeId] = normalizeStatus(row?.status);
  }

  return statusMap;
}

export async function upsertMessageStatuses(items = []) {
  const supabase = requireSupabase();
  const now = new Date().toISOString();
  const rows = [];

  for (const item of items) {
    const safeId = normalizeMessageId(item?.messageId);
    if (!safeId) continue;

    rows.push({
      message_id: safeId,
      status: normalizeStatus(item?.status),
      source: normalizeSource(item?.source),
      updated_by: String(item?.updatedBy || "").trim() || null,
      metadata: normalizeMetadata(item?.metadata),
      updated_at: now,
    });
  }

  if (!rows.length) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(rows, { onConflict: "message_id" })
    .select("message_id, status, source, updated_by, metadata, created_at, updated_at");

  if (error) {
    throw new Error(error.message || "Unable to upsert message statuses.");
  }

  return Array.isArray(data) ? data : [];
}

export async function setMessageStatus(id, status, options = {}) {
  const safeId = normalizeMessageId(id);

  if (!safeId) {
    throw new Error("Message id is required.");
  }

  const rows = await upsertMessageStatuses([
    {
      messageId: safeId,
      status,
      source: options?.source,
      updatedBy: options?.updatedBy,
      metadata: options?.metadata,
    },
  ]);

  return normalizeStatus(rows?.[0]?.status);
}

export async function listMessageStatusEntries({ limit = 100, source = "" } = {}) {
  const supabase = requireSupabase();
  const safeLimit = Math.max(1, Math.min(500, Number(limit) || 100));
  const safeSource = String(source || "").trim();

  let query = supabase
    .from(TABLE_NAME)
    .select("message_id, status, source, updated_by, metadata, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(safeLimit);

  if (safeSource) {
    query = query.eq("source", safeSource);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Unable to list message status records.");
  }

  return Array.isArray(data) ? data : [];
}

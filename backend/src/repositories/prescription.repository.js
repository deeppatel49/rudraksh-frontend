import { getSupabaseClient } from "../config/supabase.js";

function isMissingColumnError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("could not find") && message.includes("column");
}

function rowToRecord(row) {
  const uploadedAt = row.uploaded_at || row.created_at || new Date().toISOString();
  return {
    id: row.reference_id || row.id,
    referenceId: row.reference_id || row.id,
    customerName: row.customer_name,
    mobileNumber: row.mobile_number,
    fileName: row.file_name,
    fileUrl: row.file_url || "",
    filePath: row.file_path || "",
    mimeType: row.mime_type || "",
    uploadedAt,
    processingMode: row.processing_mode || "everything",
    callForSelections: Boolean(row.call_for_selections ?? false),
    processingUpdatedAt: row.processing_updated_at || row.updated_at || uploadedAt,
  };
}

export async function createPrescriptionRecord(input) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured.");

  const now = new Date().toISOString();
  const fullInsertPayload = {
    reference_id: String(input.referenceId || "").trim(),
    customer_name: String(input.customerName || "").trim(),
    mobile_number: String(input.mobileNumber || "").trim(),
    file_name: String(input.fileName || "").trim(),
    file_url: String(input.fileUrl || "").trim(),
    file_path: String(input.filePath || "").trim(),
    mime_type: String(input.mimeType || "").trim(),
    processing_mode: String(input.processingMode || "everything").trim(),
    call_for_selections: Boolean(input.callForSelections),
    processing_updated_at: input.processingUpdatedAt || now,
    uploaded_at: input.uploadedAt || now,
  };

  let { data, error } = await supabase
    .from("prescriptions")
    .insert(fullInsertPayload)
    .select()
    .single();

  if (error && isMissingColumnError(error)) {
    // Backward-compatible fallback for legacy table shape.
    let legacyInsertPayload = {
      reference_id: String(input.referenceId || "").trim(),
      customer_name: String(input.customerName || "").trim(),
      mobile_number: String(input.mobileNumber || "").trim(),
      file_name: String(input.fileName || "").trim(),
      file_url: String(input.fileUrl || "").trim(),
      file_path: String(input.filePath || "").trim(),
      mime_type: String(input.mimeType || "").trim(),
    };

    let fallback = await supabase
      .from("prescriptions")
      .insert(legacyInsertPayload)
      .select()
      .single();

    if (fallback.error && isMissingColumnError(fallback.error)) {
      // Extra-safe fallback for very old schema versions without file_path / mime_type.
      legacyInsertPayload = {
        reference_id: String(input.referenceId || "").trim(),
        customer_name: String(input.customerName || "").trim(),
        mobile_number: String(input.mobileNumber || "").trim(),
        file_name: String(input.fileName || "").trim(),
        file_url: String(input.fileUrl || "").trim(),
      };

      fallback = await supabase
        .from("prescriptions")
        .insert(legacyInsertPayload)
        .select()
        .single();
    }

    data = fallback.data;
    error = fallback.error;
  }

  if (error) throw new Error(`Failed to create prescription: ${error.message}`);
  return rowToRecord(data);
}

export async function updatePrescriptionProcessing(referenceIds, input) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured.");

  const safeIds = Array.isArray(referenceIds)
    ? referenceIds.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  if (!safeIds.length) return [];

  const safeMode = String(input.processingMode || "").trim() === "call" ? "call" : "everything";
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("prescriptions")
    .update({
      processing_mode: safeMode,
      call_for_selections: Boolean(input.callForSelections),
      processing_updated_at: input.processingUpdatedAt || now,
      updated_at: now,
    })
    .in("reference_id", safeIds)
    .select();

  if (error && isMissingColumnError(error)) {
    // Legacy schema does not have processing columns; skip hard failure.
    return [];
  }

  if (error) throw new Error(`Failed to update prescription processing: ${error.message}`);
  return (data || []).map(rowToRecord);
}

export async function listPrescriptionRecords(limit = 100) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured.");

  const safeLimit = Math.max(1, Math.min(500, Number(limit) || 100));

  let { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .order("uploaded_at", { ascending: false })
    .limit(safeLimit);

  if (error && isMissingColumnError(error)) {
    const fallback = await supabase
      .from("prescriptions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(safeLimit);
    data = fallback.data;
    error = fallback.error;
  }

  if (error) throw new Error(`Failed to list prescriptions: ${error.message}`);
  return (data || []).map(rowToRecord);
}

export async function getPrescriptionByReferenceId(referenceId) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured.");

  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("reference_id", String(referenceId).trim())
    .maybeSingle();

  if (error) throw new Error(`Failed to get prescription: ${error.message}`);
  return data ? rowToRecord(data) : null;
}

export async function listPrescriptionsByMobile(mobileNumber, limit = 20) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured.");

  let { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("mobile_number", String(mobileNumber).replace(/\D/g, ""))
    .order("uploaded_at", { ascending: false })
    .limit(Math.min(50, Number(limit) || 20));

  if (error && isMissingColumnError(error)) {
    const fallback = await supabase
      .from("prescriptions")
      .select("*")
      .eq("mobile_number", String(mobileNumber).replace(/\D/g, ""))
      .order("created_at", { ascending: false })
      .limit(Math.min(50, Number(limit) || 20));
    data = fallback.data;
    error = fallback.error;
  }

  if (error) throw new Error(`Failed to list prescriptions by mobile: ${error.message}`);
  return (data || []).map(rowToRecord);
}

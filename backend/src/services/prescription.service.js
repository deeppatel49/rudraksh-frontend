import { getSupabaseClient } from "../config/supabase.js";
import {
  createPrescriptionRecord,
  getPrescriptionByReferenceId,
  listPrescriptionRecords,
  listPrescriptionsByMobile,
  updatePrescriptionProcessing,
} from "../repositories/prescription.repository.js";

const BUCKET = "prescriptions";
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

async function ensurePrescriptionsBucket(supabase) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = Array.isArray(buckets) && buckets.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error && !error.message?.includes("already exists")) {
      throw new Error(`Failed to create storage bucket: ${error.message}`);
    }
  }
}

async function uploadFileToStorage(supabase, fileBuffer, storagePath, mimeType) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return urlData?.publicUrl || "";
}

export async function uploadPrescription({ fileBuffer, originalName, mimeType, customerName, mobileNumber }) {
  if (!customerName || String(customerName).trim().length < 2) {
    throw Object.assign(new Error("Customer name is required."), { status: 400 });
  }

  const safeMobile = String(mobileNumber || "").replace(/\D/g, "");
  if (safeMobile.length < 10 || safeMobile.length > 15) {
    throw Object.assign(new Error("Valid mobile number is required."), { status: 400 });
  }

  const safeMime = String(mimeType || "").toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(safeMime)) {
    throw Object.assign(new Error("Invalid file type. Upload JPG, PNG, or PDF."), { status: 400 });
  }

  if (!fileBuffer || fileBuffer.length > MAX_FILE_SIZE) {
    throw Object.assign(new Error("File size must be 5 MB or less."), { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured on the backend.");
  }

  await ensurePrescriptionsBucket(supabase);

  const ext = safeMime === "application/pdf" ? ".pdf"
    : safeMime === "image/png" ? ".png"
    : ".jpg";
  const referenceId = `RX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const storagePath = `${referenceId}${ext}`;
  const uploadedAt = new Date().toISOString();

  const fileUrl = await uploadFileToStorage(supabase, fileBuffer, storagePath, safeMime);

  const record = await createPrescriptionRecord({
    referenceId,
    customerName: String(customerName).trim(),
    mobileNumber: safeMobile,
    fileName: String(originalName || storagePath).trim(),
    fileUrl,
    filePath: storagePath,
    mimeType: safeMime,
    uploadedAt,
    processingMode: "everything",
    callForSelections: false,
    processingUpdatedAt: uploadedAt,
  });

  return record;
}

export async function listPrescriptions(limit = 100) {
  return listPrescriptionRecords(limit);
}

export async function getPrescription(referenceId) {
  return getPrescriptionByReferenceId(referenceId);
}

export async function getPrescriptionsByMobile(mobileNumber, limit = 20) {
  const safeMobile = String(mobileNumber || "").replace(/\D/g, "");
  if (safeMobile.length < 10) {
    throw Object.assign(new Error("Valid mobile number is required."), { status: 400 });
  }
  return listPrescriptionsByMobile(safeMobile, limit);
}

export async function updateProcessingMode(referenceIds, { processingMode, callForSelections }) {
  const safeIds = Array.isArray(referenceIds)
    ? referenceIds.map((id) => String(id || "").trim()).filter(Boolean)
    : [];
  if (!safeIds.length) {
    throw Object.assign(new Error("At least one referenceId is required."), { status: 400 });
  }
  return updatePrescriptionProcessing(safeIds, {
    processingMode,
    callForSelections,
    processingUpdatedAt: new Date().toISOString(),
  });
}

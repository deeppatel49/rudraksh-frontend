import {
  getPrescription,
  getPrescriptionsByMobile,
  listPrescriptions,
  updateProcessingMode,
  uploadPrescription,
} from "../services/prescription.service.js";

export async function upload(req, res) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Prescription file is required." });
    }

    const customerName = String(req.body?.customerName || "").trim();
    const mobileNumber = String(req.body?.mobileNumber || "").replace(/\D/g, "");

    const record = await uploadPrescription({
      fileBuffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      customerName,
      mobileNumber,
    });

    return res.status(201).json({
      message: "Prescription uploaded successfully.",
      referenceId: record.referenceId,
      fileUrl: record.fileUrl,
      customerName: record.customerName,
      mobileNumber: record.mobileNumber,
      uploadedAt: record.uploadedAt,
      mimeType: record.mimeType,
    });
  } catch (err) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || "Unable to upload prescription." });
  }
}

export async function list(req, res) {
  try {
    const limit = Number(req.query?.limit) || 100;
    const mobile = String(req.query?.mobile || "").replace(/\D/g, "");

    const records = mobile.length >= 10
      ? await getPrescriptionsByMobile(mobile, limit)
      : await listPrescriptions(limit);

    return res.json({ prescriptions: records, total: records.length });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Unable to list prescriptions." });
  }
}

export async function getByReferenceId(req, res) {
  try {
    const referenceId = String(req.params?.referenceId || "").trim();
    if (!referenceId) {
      return res.status(400).json({ error: "referenceId is required." });
    }

    const record = await getPrescription(referenceId);
    if (!record) {
      return res.status(404).json({ error: "Prescription not found." });
    }

    return res.json({ prescription: record });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Unable to fetch prescription." });
  }
}

export async function updateProcessing(req, res) {
  try {
    const { referenceIds, processingMode, callForSelections } = req.body || {};
    const updated = await updateProcessingMode(
      Array.isArray(referenceIds) ? referenceIds : [referenceIds],
      { processingMode, callForSelections }
    );
    return res.json({ updated, count: updated.length });
  } catch (err) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || "Unable to update processing." });
  }
}

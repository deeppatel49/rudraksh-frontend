const INQUIRY_TYPES = new Set([
  "Medicine Availability",
  "Order Support",
  "Bulk Purchase",
  "Prescription Help",
]);

function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 15);
}

export function validateContactPayload(payload) {
  const name = String(payload?.name || "").trim();
  const email = String(payload?.email || "").trim();
  const phone = cleanPhone(payload?.phone);
  const inquiryType = String(payload?.inquiryType || "").trim();
  const message = String(payload?.message || "").trim();

  if (name.length < 2) {
    return "Name must be at least 2 characters.";
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "Please provide a valid email address.";
  }

  if (phone && phone.length < 10) {
    return "Phone number must be at least 10 digits.";
  }

  if (!INQUIRY_TYPES.has(inquiryType)) {
    return "Please select a valid inquiry type.";
  }

  if (message.length < 10) {
    return "Message must be at least 10 characters.";
  }

  return null;
}

export async function submitContactForm(payload) {
  return {
    message: "Inquiry submitted successfully.",
    submissionId: `local-${Date.now()}`,
    source: "local",
    contact: {
      name: String(payload.name || "").trim(),
      email: String(payload.email || "").trim(),
      phone: cleanPhone(payload.phone),
      inquiryType: String(payload.inquiryType || "").trim(),
    },
  };
}

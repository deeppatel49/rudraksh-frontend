import { z } from "zod";
import { INQUIRY_TYPES } from "../constants/inquiry-types.js";
import { createContactSubmission } from "../repositories/contact.repository.js";
import { setMessageStatus } from "../repositories/message-status.repository.js";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  inquiryType: z.enum(INQUIRY_TYPES),
  message: z.string().min(10),
});

function sanitizePhone(input) {
  return String(input || "").replace(/\D/g, "").slice(0, 15);
}

export function validateContactPayload(payload) {
  return contactSchema.safeParse(payload);
}

export async function submitContact(payload) {
  const phone = sanitizePhone(payload.phone);

  const created = await createContactSubmission({
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone,
    inquiry_type: payload.inquiryType,
    message: payload.message.trim(),
    source: "website",
  });

  await setMessageStatus(created.id, "not-read", {
    source: "contact_submissions",
    updatedBy: payload.email?.trim() || "website",
    metadata: {
      inquiryType: payload.inquiryType,
      email: payload.email?.trim() || "",
    },
  });

  return {
    message: "Inquiry submitted successfully.",
    submissionId: created.id,
    createdAt: created.created_at,
  };
}

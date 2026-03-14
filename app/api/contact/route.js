import { createBackendApiUrl } from "../../lib/backend-api.js";
import { validateContactPayload } from "../../lib/services/contact-service.js";
import { badRequest, internalServerError, ok } from "../../lib/utils/api-response.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid request payload.");
  }

  const validationError = validateContactPayload(payload);
  if (validationError) {
    return badRequest(validationError);
  }

  try {
    const response = await fetch(createBackendApiUrl("/contact"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: String(payload.name || "").trim(),
        email: String(payload.email || "").trim(),
        phone: String(payload.phone || "").trim(),
        inquiryType: String(payload.inquiryType || "").trim(),
        message: String(payload.message || "").trim(),
      }),
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return internalServerError("Unable to submit inquiry right now.");
  }
}

export async function GET() {
  return ok({
    message: "Use POST to submit contact inquiries.",
    requiredFields: ["name", "email", "phone", "inquiryType", "message"],
  });
}

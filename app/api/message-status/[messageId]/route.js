import { createBackendApiUrl } from "../../../lib/backend-api.js";
import { badRequest, internalServerError } from "../../../lib/utils/api-response.js";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid request payload.");
  }

  const messageId = String(params?.messageId || "").trim();
  if (!messageId) {
    return badRequest("messageId is required.");
  }

  try {
    const response = await fetch(createBackendApiUrl(`/message-status/${encodeURIComponent(messageId)}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = await response.json().catch(() => ({}));
    return new Response(JSON.stringify(body), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return internalServerError("Unable to update message status right now.");
  }
}

import { createBackendApiUrl } from "../../lib/backend-api.js";
import { badRequest, internalServerError } from "../../lib/utils/api-response.js";

export const dynamic = "force-dynamic";

function buildBackendUrl(request) {
  const { search } = new URL(request.url);
  return `${createBackendApiUrl("/message-status")}${search || ""}`;
}

export async function GET(request) {
  try {
    const response = await fetch(buildBackendUrl(request), {
      method: "GET",
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));
    return new Response(JSON.stringify(payload), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return internalServerError("Unable to fetch message statuses right now.");
  }
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid request payload.");
  }

  try {
    const response = await fetch(createBackendApiUrl("/message-status"), {
      method: "POST",
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
    return internalServerError("Unable to save message status right now.");
  }
}

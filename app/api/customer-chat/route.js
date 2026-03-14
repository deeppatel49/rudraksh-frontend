import { createBackendApiUrl } from "../../lib/backend-api.js";

export const dynamic = "force-dynamic";

function buildBackendUrl(request) {
  const { search } = new URL(request.url);
  return `${createBackendApiUrl("/customer-chat")}${search || ""}`;
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
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || "Unable to load seller messages right now." }), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
}

export async function POST(request) {
  try {
    const contentType = String(request.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Frontend uploads are disabled. Only backend/admin can upload media." }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    const payload = await request.json();
    if (payload?.attachment?.url) {
      return new Response(JSON.stringify({ error: "Frontend uploads are disabled. Only backend/admin can upload media." }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    let message = String(payload?.message || "").trim();

    if (!message && !payload?.attachment?.url) {
      message = "(no text)";
    }

    if (!payload?.userId && !payload?.email && !payload?.phone) {
      return new Response(JSON.stringify({ error: "A user identifier is required." }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    const response = await fetch(createBackendApiUrl("/customer-chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        senderRole: payload.senderRole || "seller",
        senderName: payload.senderName || "Seller",
        message,
        attachment: payload.attachment,
      }),
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
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || "Unable to save seller message right now." }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
}

import { createBackendApiUrl } from "../../../lib/backend-api";

export const dynamic = "force-dynamic";

function buildBackendUrl(request, pathSegments = []) {
  const safeSegments = Array.isArray(pathSegments)
    ? pathSegments.filter(Boolean)
    : String(pathSegments || "")
        .split("/")
        .map((segment) => segment.trim())
        .filter(Boolean);
  const pathname = `/customer-auth/${safeSegments.join("/")}`;
  const { search } = new URL(request.url);
  return `${createBackendApiUrl(pathname)}${search || ""}`;
}

async function proxyToBackend(request, context, method) {
  try {
    const pathSegments = context?.params?.path || [];
    const targetUrl = buildBackendUrl(request, pathSegments);
    const headers = {
      Accept: "application/json",
    };

    const contentType = String(request.headers.get("content-type") || "").toLowerCase();
    const init = {
      method,
      headers,
      cache: "no-store",
    };

    if (method !== "GET") {
      const rawBody = await request.text();
      if (rawBody) {
        init.body = rawBody;
        if (contentType) {
          headers["Content-Type"] = contentType;
        } else {
          headers["Content-Type"] = "application/json";
        }
      }
    }

    const response = await fetch(targetUrl, init);
    const responseText = await response.text();

    return new Response(responseText || "{}", {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || "Unable to connect to auth service." }), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
}

export async function GET(request, context) {
  return proxyToBackend(request, context, "GET");
}

export async function POST(request, context) {
  return proxyToBackend(request, context, "POST");
}

export async function PUT(request, context) {
  return proxyToBackend(request, context, "PUT");
}

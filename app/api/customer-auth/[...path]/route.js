import { createBackendApiUrl } from "../../../lib/backend-api";

export const dynamic = "force-dynamic";

function buildBackendUrl(request) {
  const url = new URL(request.url);
  const routePrefix = "/api/customer-auth";
  let forwardedPath = url.pathname.startsWith(routePrefix)
    ? url.pathname.slice(routePrefix.length)
    : "";

  forwardedPath = String(forwardedPath || "").replace(/^\/+/, "").trim();
  const pathname = forwardedPath ? `/customer-auth/${forwardedPath}` : "/customer-auth";
  return `${createBackendApiUrl(pathname)}${url.search || ""}`;
}

async function proxyToBackend(request, method) {
  try {
    const url = new URL(request.url);
    if (url.pathname === "/api/customer-auth" || url.pathname === "/api/customer-auth/") {
      return new Response(JSON.stringify({ error: "Customer auth endpoint is missing a path." }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    const targetUrl = buildBackendUrl(request);
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
  return proxyToBackend(request, "GET");
}

export async function POST(request, context) {
  return proxyToBackend(request, "POST");
}

export async function PUT(request, context) {
  return proxyToBackend(request, "PUT");
}

const DEFAULT_BACKEND_URL = "http://localhost:5000";
const API_PREFIX = "/api/v1";

function getBackendBaseUrl() {
  const raw = String(process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL).trim().replace(/\/+$/, "");
  if (!raw) {
    return DEFAULT_BACKEND_URL;
  }

  return raw.endsWith(API_PREFIX) ? raw.slice(0, -API_PREFIX.length) : raw;
}

function toSafePath(parts) {
  const segments = Array.isArray(parts) ? parts.map((item) => String(item || "").trim()) : [];
  if (!segments.length) {
    return "";
  }

  if (segments.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("\\"))) {
    return "";
  }

  return segments.join("/");
}

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const safePath = toSafePath(resolvedParams?.path);
  if (!safePath) {
    return new Response("Not found", { status: 404 });
  }

  const targetUrl = `${getBackendBaseUrl()}/${safePath}`;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 10000);

  let response;
  try {
    response = await fetch(targetUrl, {
      cache: "no-store",
      signal: timeoutController.signal,
    });
  } catch {
    clearTimeout(timeoutId);
    return new Response("Media proxy timeout", { status: 504 });
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    return new Response("Not found", { status: response.status });
  }

  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  // Let browsers cache immutable uploads briefly, but avoid stale during dev.
  headers.set("cache-control", "public, max-age=60");

  return new Response(response.body, {
    status: 200,
    headers,
  });
}


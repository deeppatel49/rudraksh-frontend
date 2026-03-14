const DEFAULT_BACKEND_URL = "http://localhost:5000";
const API_PREFIX = "/api/v1";

function normalizeApiBaseUrl(rawUrl) {
  const trimmed = String(rawUrl || "").trim().replace(/\/+$/, "");
  if (!trimmed) {
    return "";
  }

  return trimmed.endsWith(API_PREFIX) ? trimmed : `${trimmed}${API_PREFIX}`;
}

export function getBackendApiBaseUrl() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
  return normalizeApiBaseUrl(backendUrl);
}

export function createBackendApiUrl(pathname) {
  const base = getBackendApiBaseUrl().replace(/\/+$/, "");
  const path = String(pathname || "").startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export function createBackendAssetUrl(pathname) {
  const path = String(pathname || "").trim();

  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return encodeURI(path);
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Proxy backend-managed uploads (and similar) through Next so `next/image` works.
  if (normalizedPath.startsWith("/uploads/") || normalizedPath.startsWith("/prescriptions/")) {
    return encodeURI(`/api/media${normalizedPath}`);
  }

  // Otherwise treat as a local public asset path.
  return encodeURI(normalizedPath);
}

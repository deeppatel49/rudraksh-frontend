const API_BASE = "/api/message-status";

export async function fetchMessageStatuses(ids = []) {
  const safeIds = ids
    .map((id) => String(id || "").trim())
    .filter(Boolean);

  if (!safeIds.length) {
    return {};
  }

  const query = new URLSearchParams({ ids: safeIds.join(",") });
  const response = await fetch(`${API_BASE}?${query.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to fetch message statuses.");
  }

  return payload?.messages || {};
}

export async function createOrUpdateMessageStatus(input) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input || {}),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to save message status.");
  }

  return payload;
}

export async function patchMessageStatus(messageId, status, extras = {}) {
  const safeId = String(messageId || "").trim();
  if (!safeId) {
    throw new Error("messageId is required.");
  }

  const response = await fetch(`${API_BASE}/${encodeURIComponent(safeId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, ...extras }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to update message status.");
  }

  return payload;
}

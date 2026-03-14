import { env } from "../config/env.js";

function sanitize(value) {
  return String(value || "").trim();
}

function normalizeFilters(filters = {}) {
  return {
    userId: sanitize(filters.userId),
    email: sanitize(filters.email).toLowerCase(),
    phone: sanitize(filters.phone),
  };
}

function matchesFilters(messageLike, filters) {
  const safeMessage = normalizeFilters(messageLike);
  const safeFilters = normalizeFilters(filters);

  if (safeFilters.userId && safeMessage.userId && safeMessage.userId === safeFilters.userId) {
    return true;
  }

  if (safeFilters.email && safeMessage.email && safeMessage.email === safeFilters.email) {
    return true;
  }

  if (safeFilters.phone && safeMessage.phone && safeMessage.phone === safeFilters.phone) {
    return true;
  }

  return false;
}

const clients = new Set();

function writeSse(res, eventName, payload) {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export function registerCustomerChatEventsStream({ req, res, filters }) {
  const normalized = normalizeFilters(filters);

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Access-Control-Allow-Origin", env.frontendUrl || "*");

  // Flush headers early (when supported).
  res.flushHeaders?.();

  const client = {
    res,
    filters: normalized,
  };

  clients.add(client);

  writeSse(res, "connected", { ok: true, timestamp: new Date().toISOString() });

  const keepAliveId = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      // Ignore; close handler will cleanup.
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(keepAliveId);
    clients.delete(client);
  });

  return client;
}

export function publishCustomerChatEvent(eventName, payload) {
  for (const client of clients) {
    try {
      const messageLike = payload?.message || payload?.item || payload?.deletedMessage || payload || {};
      if (!matchesFilters(messageLike, client.filters)) {
        continue;
      }

      writeSse(client.res, eventName, payload);
    } catch {
      // If a client is broken, drop it.
      clients.delete(client);
    }
  }
}


import crypto from "node:crypto";

const TOKEN_TTL_MS = 15 * 60 * 1000;

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64url(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function getSecret() {
  return String(process.env.PRESCRIPTION_SHARE_SECRET || "").trim();
}

export function createPrescriptionShareToken(payload) {
  const secret = getSecret();
  if (!secret) {
    throw new Error("PRESCRIPTION_SHARE_SECRET is missing.");
  }

  const now = Date.now();
  const envelope = {
    ...payload,
    issuedAt: now,
    expiresAt: now + TOKEN_TTL_MS,
  };

  const body = base64url(JSON.stringify(envelope));
  const signature = base64url(
    crypto.createHmac("sha256", secret).update(body).digest()
  );

  return `${body}.${signature}`;
}

export function verifyPrescriptionShareToken(token) {
  const secret = getSecret();
  if (!secret) {
    throw new Error("PRESCRIPTION_SHARE_SECRET is missing.");
  }

  const [body, signature] = String(token || "").split(".");
  if (!body || !signature) {
    return { ok: false, error: "Invalid share token." };
  }

  const expectedSignature = base64url(
    crypto.createHmac("sha256", secret).update(body).digest()
  );

  if (signature !== expectedSignature) {
    return { ok: false, error: "Invalid share signature." };
  }

  let decoded;
  try {
    decoded = JSON.parse(fromBase64url(body));
  } catch {
    return { ok: false, error: "Invalid token payload." };
  }

  if (!decoded?.expiresAt || Date.now() > Number(decoded.expiresAt)) {
    return { ok: false, error: "Share token expired." };
  }

  return {
    ok: true,
    payload: decoded,
  };
}

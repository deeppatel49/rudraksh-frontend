import crypto from "node:crypto";

const OTP_TTL_MS = 5 * 60 * 1000;
const VERIFIED_TTL_MS = 10 * 60 * 1000;

function getStore() {
  if (!globalThis.__rudrakshOtpStore) {
    globalThis.__rudrakshOtpStore = new Map();
  }
  return globalThis.__rudrakshOtpStore;
}

function buildKey(payload) {
  return String(payload?.identifier || "").trim().toLowerCase();
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function randomToken() {
  return crypto.randomUUID();
}

export function createOtpChallenge(payload) {
  const otp = randomOtp();
  const now = Date.now();
  const key = buildKey(payload);
  const store = getStore();

  store.set(key, {
    otpHash: hashOtp(otp),
    createdAt: now,
    expiresAt: now + OTP_TTL_MS,
    verified: false,
    resetToken: null,
    resetTokenExpiresAt: 0,
  });

  return { otp, key, expiresAt: now + OTP_TTL_MS };
}

export function verifyOtpChallenge(payload, otpInput) {
  const key = buildKey(payload);
  const store = getStore();
  const record = store.get(key);

  if (!record) {
    return { ok: false, error: "No OTP request found. Please send OTP again." };
  }

  if (Date.now() > record.expiresAt) {
    store.delete(key);
    return { ok: false, error: "OTP expired. Please request a new OTP." };
  }

  if (hashOtp(otpInput) !== record.otpHash) {
    return { ok: false, error: "Invalid OTP. Please try again." };
  }

  const resetToken = randomToken();
  const nextRecord = {
    ...record,
    verified: true,
    resetToken,
    resetTokenExpiresAt: Date.now() + VERIFIED_TTL_MS,
  };
  store.set(key, nextRecord);

  return { ok: true, resetToken };
}

export function validateResetToken(payload, resetToken) {
  const key = buildKey(payload);
  const store = getStore();
  const record = store.get(key);
  if (!record || !record.verified) {
    return false;
  }
  if (record.resetToken !== resetToken) {
    return false;
  }
  if (Date.now() > record.resetTokenExpiresAt) {
    store.delete(key);
    return false;
  }
  return true;
}

export function consumeResetToken(payload) {
  const key = buildKey(payload);
  const store = getStore();
  store.delete(key);
}

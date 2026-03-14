import crypto from "crypto";

const SCRYPT_KEY_LENGTH = 64;

export function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

export function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), String(salt), SCRYPT_KEY_LENGTH).toString("hex");
}

export function verifyPassword(password, salt, expectedHash) {
  const derivedHash = hashPassword(password, salt);
  const left = Buffer.from(derivedHash, "hex");
  const right = Buffer.from(String(expectedHash), "hex");
  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

export function generateSessionToken() {
  return crypto.randomBytes(48).toString("hex");
}

export function hashSessionToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

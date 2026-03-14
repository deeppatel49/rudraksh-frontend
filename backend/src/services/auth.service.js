import { z } from "zod";
import { env } from "../config/env.js";
import {
  createAdminSession,
  createAdminUser,
  getAdminUserCount,
  deleteSessionByTokenHash,
  getAdminUserByEmail,
  getSessionWithUserByTokenHash,
} from "../repositories/auth.repository.js";
import {
  generateSalt,
  generateSessionToken,
  hashPassword,
  hashSessionToken,
  verifyPassword,
} from "../utils/crypto.js";

const signUpSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function mapAdminUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function getSessionExpiryIso() {
  const now = Date.now();
  const ttlHours = Math.max(1, Number(env.authSessionHours) || 24);
  return new Date(now + ttlHours * 60 * 60 * 1000).toISOString();
}

export function validateSignUpPayload(payload) {
  return signUpSchema.safeParse(payload);
}

export function validateSignInPayload(payload) {
  return signInSchema.safeParse(payload);
}

export async function signUpAdmin(payload, metadata = {}) {
  const email = payload.email.trim().toLowerCase();
  const existing = await getAdminUserByEmail(email);
  if (existing) {
    const error = new Error("Account already exists. Please sign in.");
    error.code = "ACCOUNT_EXISTS";
    throw error;
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(payload.password, salt);

  const user = await createAdminUser({
    full_name: payload.fullName.trim(),
    email,
    password_hash: passwordHash,
    password_salt: salt,
  });

  const rawToken = generateSessionToken();
  await createAdminSession({
    user_id: user.id,
    token_hash: hashSessionToken(rawToken),
    user_agent: metadata.userAgent || null,
    ip_address: metadata.ipAddress || null,
    expires_at: getSessionExpiryIso(),
  });

  return {
    token: rawToken,
    user: mapAdminUser(user),
  };
}

export async function signInAdmin(payload, metadata = {}) {
  const email = payload.email.trim().toLowerCase();
  let user = await getAdminUserByEmail(email);

  // For local development, bootstrap the first admin account from the first login attempt.
  if (!user && env.nodeEnv !== "production") {
    const adminUserCount = await getAdminUserCount();

    if (adminUserCount === 0) {
      const salt = generateSalt();
      const passwordHash = hashPassword(payload.password, salt);

      user = await createAdminUser({
        full_name: payload.email.split("@")[0] || "Admin",
        email,
        password_hash: passwordHash,
        password_salt: salt,
      });
    }
  }

  if (!user) {
    const error = new Error("Account not found. Please sign up.");
    error.code = "ACCOUNT_NOT_FOUND";
    throw error;
  }

  if (!user.is_active) {
    const error = new Error("Account is inactive. Contact support.");
    error.code = "ACCOUNT_INACTIVE";
    throw error;
  }

  const isValidPassword = verifyPassword(payload.password, user.password_salt, user.password_hash);
  if (!isValidPassword) {
    const error = new Error("Invalid email or password.");
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const rawToken = generateSessionToken();
  await createAdminSession({
    user_id: user.id,
    token_hash: hashSessionToken(rawToken),
    user_agent: metadata.userAgent || null,
    ip_address: metadata.ipAddress || null,
    expires_at: getSessionExpiryIso(),
  });

  return {
    token: rawToken,
    user: mapAdminUser(user),
  };
}

export async function getAdminFromToken(rawToken) {
  if (!rawToken) {
    return null;
  }

  const session = await getSessionWithUserByTokenHash(hashSessionToken(rawToken));
  if (!session) {
    return null;
  }

  const expiresAt = Date.parse(session.expires_at);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    await deleteSessionByTokenHash(hashSessionToken(rawToken));
    return null;
  }

  const adminUser = Array.isArray(session.admin_users)
    ? session.admin_users[0]
    : session.admin_users;

  if (!adminUser || !adminUser.is_active) {
    return null;
  }

  return mapAdminUser(adminUser);
}

export async function signOutAdmin(rawToken) {
  if (!rawToken) {
    return;
  }

  await deleteSessionByTokenHash(hashSessionToken(rawToken));
}

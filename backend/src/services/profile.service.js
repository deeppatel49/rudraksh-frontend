import { z } from "zod";
import {
  getAdminProfileByUserId,
  listRecentAdminSessionsByUserId,
  upsertAdminProfileByUserId,
} from "../repositories/profile.repository.js";
import {
  getAdminUserAuthById,
  getAdminUserByEmail,
  updateAdminUserById,
} from "../repositories/auth.repository.js";
import { verifyPassword, generateSalt, hashPassword } from "../utils/crypto.js";
import { readLoginActivities } from "../repositories/customer-auth.repository.js";

const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().email(),
  mobileNumber: z.string().trim().regex(/^\d{10,15}$/),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^[a-zA-Z0-9\-\s]{4,10}$/),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).max(128).optional(),
  confirmPassword: z.string().min(6).max(128).optional(),
});

function mapProfile(row, adminUser = null) {
  const fallbackName = String(adminUser?.fullName || "").trim() || String(adminUser?.email || "").split("@")[0] || "";

  return {
    userId: row?.user_id || adminUser?.id || "",
    fullName: row?.full_name || fallbackName,
    email: adminUser?.email || "",
    mobileNumber: row?.mobile_number || "",
    gender: row?.gender || "",
    address: row?.address || "",
    city: row?.city || "",
    pincode: row?.pincode || "",
    updatedAt: row?.updated_at || null,
  };
}

function normalizeProfileText(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }

  const lower = text.toLowerCase();
  if (lower === "select" || lower === "not added" || lower === "n/a") {
    return "";
  }

  return text;
}

function mergeProfileWithActivity(profile, activity) {
  if (!activity) {
    return profile;
  }

  return {
    ...profile,
    fullName: normalizeProfileText(profile.fullName) || normalizeProfileText(activity.name) || profile.fullName,
    mobileNumber: normalizeProfileText(profile.mobileNumber) || normalizeProfileText(activity.phone),
    address: normalizeProfileText(profile.address) || normalizeProfileText(activity.address),
    city: normalizeProfileText(profile.city) || normalizeProfileText(activity.city),
    pincode: normalizeProfileText(profile.pincode) || normalizeProfileText(activity.pincode),
  };
}

async function getLatestMatchingLoginActivity(adminUser) {
  try {
    const activities = await readLoginActivities();
    const userId = String(adminUser?.id || "").trim();
    const email = String(adminUser?.email || "").trim().toLowerCase();

    const match = activities.find((entry) => {
      const entryUserId = String(entry?.userId || "").trim();
      const entryEmail = String(entry?.email || "").trim().toLowerCase();
      return (userId && entryUserId && entryUserId === userId) || (email && entryEmail && entryEmail === email);
    });

    return match || null;
  } catch {
    return null;
  }
}

function mapSession(row) {
  return {
    sessionId: row.id,
    loggedInAt: row.created_at,
    lastSeenAt: row.last_seen_at,
    expiresAt: row.expires_at,
    ipAddress: row.ip_address || "",
    userAgent: row.user_agent || "",
  };
}

export function validateProfileUpdatePayload(payload) {
  return profileUpdateSchema
    .refine((data) => {
      if (data.newPassword || data.confirmPassword || data.currentPassword) {
        return Boolean(data.newPassword) && Boolean(data.currentPassword) && data.newPassword === data.confirmPassword;
      }
      return true;
    }, {
      message: "To change password, provide current password and matching confirmation.",
      path: ["newPassword"],
    })
    .safeParse(payload || {});
}

export async function fetchOwnProfile(adminUser) {
  const [profileRow, sessionRows, authRow] = await Promise.all([
    getAdminProfileByUserId(adminUser.id),
    listRecentAdminSessionsByUserId(adminUser.id, 5),
    getAdminUserAuthById(adminUser.id),
  ]);

  const canonicalUser = {
    id: adminUser.id,
    fullName: String(authRow?.full_name || adminUser?.fullName || "").trim(),
    email: String(authRow?.email || adminUser?.email || "").trim().toLowerCase(),
    isActive: typeof authRow?.is_active === "boolean" ? authRow.is_active : adminUser.isActive,
    createdAt: authRow?.created_at || adminUser.createdAt,
  };

  const latestActivity = await getLatestMatchingLoginActivity(canonicalUser);
  const mergedProfile = mergeProfileWithActivity(mapProfile(profileRow, canonicalUser), latestActivity);

  return {
    user: {
      id: canonicalUser.id,
      email: canonicalUser.email,
      isActive: canonicalUser.isActive,
      createdAt: canonicalUser.createdAt,
    },
    profile: mergedProfile,
    loginData: {
      sessionCount: sessionRows.length,
      lastLoginAt: sessionRows[0]?.created_at || null,
      recentSessions: sessionRows.map(mapSession),
    },
  };
}

export async function updateOwnProfile(adminUser, payload) {
  const parsed = validateProfileUpdatePayload(payload);
  if (!parsed.success) {
    const error = new Error("Invalid profile payload.");
    error.code = "VALIDATION_ERROR";
    error.details = parsed.error.flatten();
    throw error;
  }

  const data = parsed.data;

  // Load current auth row for password/email validation
  const authRow = await getAdminUserAuthById(adminUser.id);
  if (!authRow) {
    const error = new Error("Unable to load admin account.");
    error.code = "ACCOUNT_NOT_FOUND";
    throw error;
  }

  // Email uniqueness check
  if (data.email && data.email !== authRow.email) {
    const existing = await getAdminUserByEmail(data.email);
    if (existing && existing.id !== adminUser.id) {
      const error = new Error("Email is already in use by another admin.");
      error.code = "EMAIL_TAKEN";
      throw error;
    }
  }

  // Password change validation
  let passwordUpdate = null;
  if (data.newPassword) {
    const ok = verifyPassword(data.currentPassword || "", authRow.password_salt, authRow.password_hash);
    if (!ok) {
      const error = new Error("Current password is incorrect.");
      error.code = "INVALID_PASSWORD";
      throw error;
    }
    const salt = generateSalt();
    passwordUpdate = {
      password_hash: hashPassword(data.newPassword, salt),
      password_salt: salt,
    };
  }

  const adminUserUpdate = {};
  if (data.fullName && data.fullName !== authRow.full_name) {
    adminUserUpdate.full_name = data.fullName;
  }
  if (data.email && data.email !== authRow.email) {
    adminUserUpdate.email = data.email.toLowerCase();
  }
  if (passwordUpdate) {
    Object.assign(adminUserUpdate, passwordUpdate);
  }

  if (Object.keys(adminUserUpdate).length > 0) {
    await updateAdminUserById(adminUser.id, adminUserUpdate);
  }

  const profileRow = await upsertAdminProfileByUserId(adminUser.id, {
    full_name: data.fullName,
    mobile_number: data.mobileNumber,
    gender: data.gender,
    address: data.address,
    city: data.city,
    pincode: data.pincode,
  });

  return {
    message: "Profile updated successfully.",
    profile: mapProfile(profileRow, { ...adminUser, fullName: data.fullName, email: data.email }),
  };
}

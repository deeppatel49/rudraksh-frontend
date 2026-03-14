import { z } from "zod";
import {
  appendLoginActivity,
  createCustomerAccount,
  createUserId,
  getCustomerAccountByEmail,
  getCustomerAccountByIdentifier,
  getCustomerAccountByUserId,
  readCustomerProfileByUserId,
  readLoginActivities,
  resolveIdentifier,
  updateCustomerAccountByUserId,
  upsertCustomerProfile,
} from "../repositories/customer-auth.repository.js";
import { generateSalt, hashPassword, verifyPassword } from "../utils/crypto.js";

const REQUIRED_PROFILE_FIELDS = [
  "fullName",
  "mobileNumber",
  "whatsappNumber",
  "email",
  "address",
  "city",
  "pincode",
];

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  identifier: z.string().trim().min(3).max(120),
  mobileNumber: z.string().trim().min(10).max(20),
  password: z.string().min(6).max(128),
});

const passwordLoginSchema = z.object({
  identifier: z.string().trim().min(3).max(120),
  password: z.string().min(1).max(128),
});

const googleLoginSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().email(),
  identifier: z.string().trim().optional(),
});

const resetPasswordSchema = z.object({
  identifier: z.string().trim().min(3).max(120),
  newPassword: z.string().min(6).max(128),
});

const updateProfileSchema = z.object({
  userId: z.string().trim().min(3),
  fullName: z.string().trim().min(2),
  gender: z.string().trim().optional(),
  mobileNumber: z.string().trim().min(10).max(20),
  whatsappNumber: z.string().trim().min(10).max(20),
  email: z.string().email(),
  address: z.string().trim().min(4),
  city: z.string().trim().min(2),
  pincode: z.string().trim().min(4).max(10),
});

function toDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function buildSessionUser(account, profile) {
  return {
    id: account.userId,
    name: profile?.fullName || account.fullName || "Customer",
    fullName: profile?.fullName || "",
    gender: profile?.gender || "",
    email: account.email || profile?.email || "",
    phone: account.phone || profile?.mobileNumber || "",
    mobileNumber: profile?.mobileNumber || "",
    whatsappNumber: profile?.whatsappNumber || "",
    address: profile?.address || "",
    city: profile?.city || "",
    pincode: profile?.pincode || "",
    customerProfile: profile || null,
  };
}

function hasCompletedProfile(profile) {
  return REQUIRED_PROFILE_FIELDS.every((field) => String(profile?.[field] || "").trim());
}

async function getResolvedProfileForAccount(account) {
  const profile = await readCustomerProfileByUserId(account.userId);
  return profile || null;
}

function buildActivityPayload({ account, profile, loginMethod, identifier, metadata }) {
  return {
    userId: account.userId,
    loginMethod,
    name: profile?.fullName || account.fullName || "Customer",
    email: account.email || profile?.email || "",
    identifier: String(identifier || account.email || account.phone || "").trim(),
    phone: profile?.mobileNumber || account.phone || "",
    address: profile?.address || "",
    city: profile?.city || "",
    pincode: profile?.pincode || "",
    imageUrl: "/rudraksha-logo-v2.png",
    providerImageUrl: loginMethod === "google" ? "/rudraksha-logo-v2.png" : "/rudraksha-logo.png",
    userAgent: metadata?.userAgent || "",
    ipAddress: metadata?.ipAddress || "",
  };
}

export function validateCustomerRegisterPayload(payload) {
  return registerSchema.safeParse(payload || {});
}

export function validateCustomerPasswordLoginPayload(payload) {
  return passwordLoginSchema.safeParse(payload || {});
}

export function validateCustomerGoogleLoginPayload(payload) {
  return googleLoginSchema.safeParse(payload || {});
}

export function validateResetPasswordPayload(payload) {
  return resetPasswordSchema.safeParse(payload || {});
}

export function validateUpdateCustomerProfilePayload(payload) {
  return updateProfileSchema.safeParse(payload || {});
}

export async function registerCustomer(payload) {
  const normalized = resolveIdentifier(payload.identifier);
  if (!normalized) {
    const error = new Error("Enter a valid mobile number or email address.");
    error.code = "INVALID_IDENTIFIER";
    throw error;
  }

  const mobileDigits = toDigits(payload.mobileNumber);
  if (mobileDigits.length < 10 || mobileDigits.length > 15) {
    const error = new Error("Enter a valid mobile number.");
    error.code = "INVALID_MOBILE";
    throw error;
  }

  const existingByEmail = await getCustomerAccountByEmail(normalized.email);
  if (existingByEmail?.passwordHash) {
    const error = new Error("Account already exists. Please sign in.");
    error.code = "ACCOUNT_EXISTS";
    throw error;
  }

  const salt = generateSalt();
  const account = existingByEmail
    ? await updateCustomerAccountByUserId(existingByEmail.userId, {
        fullName: payload.name,
        email: normalized.email,
        phone: mobileDigits,
        provider: existingByEmail.provider || "manual",
        passwordHash: hashPassword(payload.password, salt),
        passwordSalt: salt,
      })
    : await createCustomerAccount({
        userId: createUserId(normalized.email),
        fullName: payload.name,
        email: normalized.email,
        phone: mobileDigits || normalized.phone,
        provider: "manual",
        passwordHash: hashPassword(payload.password, salt),
        passwordSalt: salt,
      });

  const profile = await getResolvedProfileForAccount(account);

  return {
    user: buildSessionUser(account, profile),
    profileCompleted: hasCompletedProfile(profile),
  };
}

export async function loginCustomerWithPassword(payload, metadata = {}) {
  const account = await getCustomerAccountByIdentifier(payload.identifier);
  if (!account) {
    const error = new Error("Account not found. Please create account.");
    error.code = "ACCOUNT_NOT_FOUND";
    throw error;
  }

  if (!account.passwordHash || !account.passwordSalt) {
    const error = new Error("This account uses Google sign-in. Use Continue with Google.");
    error.code = "GOOGLE_ONLY_ACCOUNT";
    throw error;
  }

  const isValidPassword = verifyPassword(payload.password, account.passwordSalt, account.passwordHash);
  if (!isValidPassword) {
    const error = new Error("Invalid password.");
    error.code = "INVALID_PASSWORD";
    throw error;
  }

  const profile = await getResolvedProfileForAccount(account);
  await appendLoginActivity(buildActivityPayload({
    account,
    profile,
    loginMethod: "manual",
    identifier: payload.identifier,
    metadata,
  }));

  return {
    user: buildSessionUser(account, profile),
    profileCompleted: hasCompletedProfile(profile),
  };
}

export async function loginCustomerWithGoogle(payload, metadata = {}) {
  const email = String(payload.email || "").trim().toLowerCase();
  let account = await getCustomerAccountByEmail(email);

  if (!account) {
    account = await createCustomerAccount({
      userId: createUserId(email),
      fullName: payload.name || "Google User",
      email,
      phone: null,
      provider: "google",
      passwordHash: null,
      passwordSalt: null,
    });
  } else {
    account = await updateCustomerAccountByUserId(account.userId, {
      fullName: payload.name || account.fullName,
      email,
      provider: "google",
    });
  }

  const profile = await getResolvedProfileForAccount(account);
  await appendLoginActivity(buildActivityPayload({
    account,
    profile,
    loginMethod: "google",
    identifier: payload.identifier || email,
    metadata,
  }));

  return {
    user: buildSessionUser(account, profile),
    profileCompleted: hasCompletedProfile(profile),
  };
}

export async function resetCustomerPassword(payload) {
  const account = await getCustomerAccountByIdentifier(payload.identifier);
  if (!account) {
    const error = new Error("Account not found. Please create account.");
    error.code = "ACCOUNT_NOT_FOUND";
    throw error;
  }

  const salt = generateSalt();
  const updated = await updateCustomerAccountByUserId(account.userId, {
    passwordHash: hashPassword(payload.newPassword, salt),
    passwordSalt: salt,
    provider: "manual",
  });

  const profile = await getResolvedProfileForAccount(updated || account);
  return {
    user: buildSessionUser(updated || account, profile),
    profileCompleted: hasCompletedProfile(profile),
  };
}

export async function accountExistsForIdentifier(identifier) {
  const account = await getCustomerAccountByIdentifier(identifier);
  return Boolean(account);
}

export async function getRecoveryContactsForIdentifier(identifier) {
  const account = await getCustomerAccountByIdentifier(identifier);
  if (!account) {
    return null;
  }

  const profile = await getResolvedProfileForAccount(account);
  return {
    email: account.email || profile?.email || "",
    mobileNumber: profile?.mobileNumber || account.phone || "",
    whatsappNumber: profile?.whatsappNumber || profile?.mobileNumber || account.phone || "",
  };
}

export async function getCustomerSessionByUserId(userId) {
  const account = await getCustomerAccountByUserId(userId);
  if (!account) {
    return null;
  }

  const profile = await getResolvedProfileForAccount(account);
  return {
    user: buildSessionUser(account, profile),
    profileCompleted: hasCompletedProfile(profile),
  };
}

export async function updateCustomerProfileData(payload) {
  const account = await getCustomerAccountByUserId(payload.userId);
  if (!account) {
    const error = new Error("Account profile not found.");
    error.code = "ACCOUNT_NOT_FOUND";
    throw error;
  }

  const profile = await upsertCustomerProfile({
    userId: payload.userId,
    fullName: payload.fullName,
    gender: payload.gender,
    mobileNumber: payload.mobileNumber,
    whatsappNumber: payload.whatsappNumber,
    email: payload.email,
    address: payload.address,
    city: payload.city,
    pincode: payload.pincode,
  });

  const updatedAccount = await updateCustomerAccountByUserId(payload.userId, {
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.mobileNumber,
  });

  return {
    user: buildSessionUser(updatedAccount || account, profile),
    profileCompleted: hasCompletedProfile(profile),
    profile,
  };
}

export async function recordCustomerLoginActivity(payload) {
  return appendLoginActivity(payload);
}

export async function listCustomerLoginActivities(limit) {
  return readLoginActivities({ limit });
}

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { readCustomerProfiles } from "./customer-profile-store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, "../data");
const dataFilePath = path.join(dataDirectory, "login-activities.json");

async function ensureStoreExists() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, "[]", "utf8");
  }
}

function sanitizeText(value, fallback = "") {
  const safeValue = String(value || "").trim();
  return safeValue || fallback;
}

function normalizeEmail(value) {
  return sanitizeText(value).toLowerCase();
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function findMatchingProfile(profiles, input = {}) {
  const targetUserId = sanitizeText(input.userId);
  const targetEmail = normalizeEmail(input.email);
  const targetPhone = normalizePhone(input.phone);

  return profiles.find((profile) => {
    const profileUserId = sanitizeText(profile?.userId);
    const profileEmail = normalizeEmail(profile?.email);
    const profileMobile = normalizePhone(profile?.mobileNumber);
    const profileWhatsapp = normalizePhone(profile?.whatsappNumber);

    if (targetUserId && profileUserId && profileUserId === targetUserId) {
      return true;
    }

    if (targetEmail && profileEmail && profileEmail === targetEmail) {
      return true;
    }

    if (targetPhone && (profileMobile === targetPhone || profileWhatsapp === targetPhone)) {
      return true;
    }

    return false;
  }) || null;
}

function mergeProfileIntoActivity(activity = {}, profile = null) {
  if (!profile) {
    return activity;
  }

  const mergedPhone = sanitizeText(activity.phone)
    || sanitizeText(profile.mobileNumber)
    || sanitizeText(profile.whatsappNumber);

  return {
    ...activity,
    userId: sanitizeText(activity.userId) || sanitizeText(profile.userId),
    name: sanitizeText(activity.name) || sanitizeText(profile.fullName),
    email: normalizeEmail(activity.email) || normalizeEmail(profile.email),
    phone: mergedPhone,
    address: sanitizeText(activity.address) || sanitizeText(profile.address),
    city: sanitizeText(activity.city) || sanitizeText(profile.city),
    pincode: sanitizeText(activity.pincode) || sanitizeText(profile.pincode),
  };
}

function encodeSvg(text) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
}

function buildInfoCardSvg({ title, accent, lines }) {
  const safeTitle = sanitizeText(title, "Login Data");
  const safeLines = lines
    .map((line) => sanitizeText(line))
    .filter(Boolean)
    .slice(0, 5);

  const textNodes = safeLines
    .map(
      (line, index) =>
        `<text x="28" y="${98 + (index * 30)}" font-size="18" fill="#1f3556" font-family="Arial, sans-serif">${line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</text>`
    )
    .join("");

  return encodeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="#f4f8ff"/>
        </linearGradient>
      </defs>
      <rect width="720" height="420" rx="28" fill="#f7fbff"/>
      <rect x="18" y="18" width="684" height="384" rx="22" fill="url(#g)" opacity="0.22"/>
      <rect x="28" y="28" width="664" height="364" rx="20" fill="#ffffff" stroke="#d6e3f1"/>
      <text x="28" y="58" font-size="30" font-weight="700" fill="#17365d" font-family="Arial, sans-serif">${safeTitle
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</text>
      ${textNodes}
    </svg>`
  );
}

function buildLoginPreview(record) {
  return buildInfoCardSvg({
    title: `${record.loginMethod === "google" ? "Google" : "Manual"} Login`,
    accent: record.loginMethod === "google" ? "#fbbc05" : "#3d6dd8",
    lines: [
      `Name: ${record.name || "Customer"}`,
      `Email: ${record.email || "Not added"}`,
      `Identifier: ${record.identifier || "Not added"}`,
      `Time: ${record.loggedInAt || "Unknown"}`,
    ],
  });
}

function buildProfilePreview(record) {
  return buildInfoCardSvg({
    title: "Profile Snapshot",
    accent: "#9ad3b0",
    lines: [
      `Phone: ${record.phone || "Not added"}`,
      `Address: ${record.address || "Not added"}`,
      `City: ${record.city || "Not added"}`,
      `Pincode: ${record.pincode || "Not added"}`,
    ],
  });
}

function normalizeRecord(record) {
  const normalized = {
    id: sanitizeText(record?.id, crypto.randomUUID()),
    userId: sanitizeText(record?.userId),
    loginMethod: sanitizeText(record?.loginMethod, "manual").toLowerCase() === "google" ? "google" : "manual",
    name: sanitizeText(record?.name, "Customer"),
    email: normalizeEmail(record?.email),
    identifier: sanitizeText(record?.identifier),
    phone: sanitizeText(record?.phone),
    address: sanitizeText(record?.address),
    city: sanitizeText(record?.city),
    pincode: sanitizeText(record?.pincode),
    imageUrl: sanitizeText(record?.imageUrl, "/rudraksha-logo-v2.png"),
    providerImageUrl: sanitizeText(
      record?.providerImageUrl,
      record?.loginMethod === "google" ? "/rudraksha-logo-v2.png" : "/rudraksha-logo.png"
    ),
    userAgent: sanitizeText(record?.userAgent),
    ipAddress: sanitizeText(record?.ipAddress),
    loggedInAt: sanitizeText(record?.loggedInAt, new Date().toISOString()),
  };

  return {
    ...normalized,
    loginPreviewUrl: buildLoginPreview(normalized),
    profilePreviewUrl: buildProfilePreview(normalized),
  };
}

export async function readLoginActivities() {
  await ensureStoreExists();

  try {
    const raw = await fs.readFile(dataFilePath, "utf8");
    const parsed = JSON.parse(raw);
    const records = Array.isArray(parsed) ? parsed : [];
    const profiles = await readCustomerProfiles();

    return records
      .map((record) => {
        const normalized = normalizeRecord(record);
        const profile = findMatchingProfile(profiles, normalized);
        return normalizeRecord(mergeProfileIntoActivity(normalized, profile));
      })
      .sort((left, right) => new Date(right.loggedInAt).getTime() - new Date(left.loggedInAt).getTime());
  } catch {
    return [];
  }
}

export async function appendLoginActivity(activity) {
  await ensureStoreExists();
  const records = await readLoginActivities();
  const profiles = await readCustomerProfiles();
  const currentTimestamp = new Date().toISOString();
  const incomingActivity = mergeProfileIntoActivity(activity || {}, findMatchingProfile(profiles, activity || {}));
  const incomingEmail = normalizeEmail(incomingActivity?.email);
  const incomingUserId = sanitizeText(incomingActivity?.userId);
  
  // Prefer userId match first, then fall back to email.
  const existingRecordIndex = records.findIndex(
    (record) => {
      const recordUserId = sanitizeText(record?.userId);
      const recordEmail = normalizeEmail(record?.email);

      if (incomingUserId && recordUserId && incomingUserId === recordUserId) {
        return true;
      }

      if (incomingEmail && recordEmail && incomingEmail === recordEmail) {
        return true;
      }

      return false;
    }
  );

  let nextRecord;
  let nextRecords;

  if (existingRecordIndex !== -1) {
    // Email exists - update that record with new login timestamp
    const existingRecord = records[existingRecordIndex];
    const mergedActivity = mergeProfileIntoActivity({
      ...existingRecord,
      userId: incomingActivity.userId || existingRecord.userId,
      loginMethod: incomingActivity.loginMethod || existingRecord.loginMethod,
      name: incomingActivity.name || existingRecord.name,
      email: incomingActivity.email || existingRecord.email,
      identifier: incomingActivity.identifier || existingRecord.identifier,
      phone: incomingActivity.phone || existingRecord.phone,
      address: incomingActivity.address || existingRecord.address,
      city: incomingActivity.city || existingRecord.city,
      pincode: incomingActivity.pincode || existingRecord.pincode,
      imageUrl: incomingActivity.imageUrl || existingRecord.imageUrl,
      providerImageUrl: incomingActivity.providerImageUrl || existingRecord.providerImageUrl,
      userAgent: incomingActivity.userAgent || existingRecord.userAgent,
      ipAddress: incomingActivity.ipAddress || existingRecord.ipAddress,
      loggedInAt: currentTimestamp,
    }, findMatchingProfile(profiles, incomingActivity));

    nextRecord = normalizeRecord({
      ...mergedActivity,
      loggedInAt: currentTimestamp,
    });

    // Replace the existing record with updated one and move it to the top
    const otherRecords = records.filter((_, index) => index !== existingRecordIndex);
    nextRecords = [nextRecord, ...otherRecords].slice(0, 500);
  } else {
    // Email doesn't exist - create a new record
    nextRecord = normalizeRecord({
      ...incomingActivity,
      id: crypto.randomUUID(),
      loggedInAt: currentTimestamp,
    });

    nextRecords = [nextRecord, ...records].slice(0, 500);
  }

  await fs.writeFile(dataFilePath, JSON.stringify(nextRecords, null, 2), "utf8");
  return nextRecord;
}

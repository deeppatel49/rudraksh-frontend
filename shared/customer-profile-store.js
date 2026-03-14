import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, "../data");
const dataFilePath = path.join(dataDirectory, "customer-profiles.json");

async function ensureStoreExists() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, "[]", "utf8");
  }
}

function sanitize(value, fallback = "") {
  const safe = String(value || "").trim();
  return safe || fallback;
}

function normalizeProfile(profile) {
  return {
    id: sanitize(profile?.id, crypto.randomUUID()),
    userId: sanitize(profile?.userId),
    fullName: sanitize(profile?.fullName, "Customer"),
    gender: sanitize(profile?.gender),
    mobileNumber: sanitize(profile?.mobileNumber),
    whatsappNumber: sanitize(profile?.whatsappNumber),
    email: sanitize(profile?.email).toLowerCase(),
    address: sanitize(profile?.address),
    city: sanitize(profile?.city),
    pincode: sanitize(profile?.pincode),
    createdAt: profile?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function readCustomerProfiles(filters = {}) {
  await ensureStoreExists();

  try {
    const raw = await fs.readFile(dataFilePath, "utf8");
    const parsed = JSON.parse(raw);
    const records = Array.isArray(parsed) ? parsed.map(normalizeProfile) : [];

    if (filters.userId) {
      return records.filter((item) => item.userId === sanitize(filters.userId));
    }

    return records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

export async function upsertCustomerProfile(profile) {
  const normalized = normalizeProfile(profile);
  await ensureStoreExists();

  try {
    const existing = await readCustomerProfiles();
    const nextRecords = existing.filter((item) => item.userId !== normalized.userId);
    nextRecords.push(normalized);
    await fs.writeFile(dataFilePath, JSON.stringify(nextRecords, null, 2), "utf8");
    return normalized;
  } catch (error) {
    throw new Error(error?.message || "Unable to save customer profile.");
  }
}

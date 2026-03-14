import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, "../data");
const dataFilePath = path.join(dataDirectory, "customer-chat-messages.json");

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

function normalizeAttachment(attachment) {
  const url = sanitize(attachment?.url);
  if (!url) {
    return null;
  }

  return {
    url,
    mimeType: sanitize(attachment?.mimeType),
    fileName: sanitize(attachment?.fileName, "attachment"),
  };
}

function normalizeMessage(message) {
  return {
    id: sanitize(message?.id, crypto.randomUUID()),
    userId: sanitize(message?.userId),
    name: sanitize(message?.name, "Customer"),
    email: sanitize(message?.email).toLowerCase(),
    phone: sanitize(message?.phone),
    senderRole: sanitize(message?.senderRole, "seller"),
    senderName: sanitize(message?.senderName, "Seller"),
    message: sanitize(message?.message),
    attachment: normalizeAttachment(message?.attachment),
    status: sanitize(message?.status, "sent"),
    createdAt: sanitize(message?.createdAt, new Date().toISOString()),
  };
}

function matchesUser(message, filters = {}) {
  const safeUserId = sanitize(filters.userId);
  const safeEmail = sanitize(filters.email).toLowerCase();
  const safePhone = sanitize(filters.phone);

  if (safeUserId && message.userId === safeUserId) {
    return true;
  }

  if (safeEmail && message.email === safeEmail) {
    return true;
  }

  if (safePhone && message.phone === safePhone) {
    return true;
  }

  return false;
}

export async function readCustomerChatMessages(filters = {}) {
  await ensureStoreExists();

  try {
    const raw = await fs.readFile(dataFilePath, "utf8");
    const parsed = JSON.parse(raw);
    const records = Array.isArray(parsed) ? parsed.map((item) => normalizeMessage(item)) : [];
    const filtered = (filters.userId || filters.email || filters.phone)
      ? records.filter((message) => matchesUser(message, filters))
      : records;

    return filtered.sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function appendCustomerChatMessage(payload) {
  await ensureStoreExists();
  const existing = await readCustomerChatMessages();
  const nextMessage = normalizeMessage({
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: payload?.senderRole === "seller" ? "sent" : "received",
  });

  const nextRecords = [...existing, nextMessage].slice(-1000);
  await fs.writeFile(dataFilePath, JSON.stringify(nextRecords, null, 2), "utf8");
  return nextMessage;
}

export async function markSellerMessagesRead(filters = {}) {
  await ensureStoreExists();

  try {
    const raw = await fs.readFile(dataFilePath, "utf8");
    const parsed = JSON.parse(raw);
    const records = Array.isArray(parsed) ? parsed.map((item) => normalizeMessage(item)) : [];

    const nextRecords = records.map((message) => {
      if (message.senderRole === "seller" && matchesUser(message, filters)) {
        return {
          ...message,
          status: "read",
        };
      }

      return message;
    });

    await fs.writeFile(dataFilePath, JSON.stringify(nextRecords, null, 2), "utf8");
    return nextRecords.filter((message) => matchesUser(message, filters));
  } catch {
    return [];
  }
}

export async function deleteCustomerChatMessage(messageId) {
  if (!messageId) {
    throw new Error("Message ID is required");
  }

  await ensureStoreExists();

  try {
    const raw = await fs.readFile(dataFilePath, "utf8");
    const parsed = JSON.parse(raw);
    const records = Array.isArray(parsed) ? parsed.map((item) => normalizeMessage(item)) : [];

    const originalLength = records.length;
    const deletedMessage = records.find((message) => message.id === messageId) || null;
    const nextRecords = records.filter((message) => message.id !== messageId);

    if (nextRecords.length === originalLength) {
      throw new Error("Message not found");
    }

    await fs.writeFile(dataFilePath, JSON.stringify(nextRecords, null, 2), "utf8");
    return {
      success: true,
      message: "Message deleted successfully",
      deletedId: messageId,
      deletedMessage,
    };
  } catch (error) {
    throw error;
  }
}

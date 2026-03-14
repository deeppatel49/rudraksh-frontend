import { getSupabaseClient } from "../config/supabase.js";

function requireSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
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

function normalizeFilters(filters = {}) {
  return {
    userId: sanitize(filters.userId),
    email: sanitize(filters.email).toLowerCase(),
    phone: sanitize(filters.phone),
  };
}

function toMessageModel(row = {}) {
  return {
    id: sanitize(row.id),
    userId: sanitize(row.user_id),
    name: sanitize(row.name, "Customer"),
    email: sanitize(row.email).toLowerCase(),
    phone: sanitize(row.phone),
    senderRole: sanitize(row.sender_role, "seller"),
    senderName: sanitize(row.sender_name, "Seller"),
    message: sanitize(row.message, "(no text)"),
    attachment: normalizeAttachment(row.attachment),
    status: sanitize(row.status, "sent"),
    createdAt: sanitize(row.created_at, new Date().toISOString()),
    threadId: sanitize(row.thread_id),
  };
}

async function findExistingThread(filters = {}) {
  const supabase = requireSupabase();
  const safe = normalizeFilters(filters);

  if (safe.userId) {
    const { data } = await supabase
      .from("customer_chat_threads")
      .select("id")
      .eq("user_id", safe.userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.id) {
      return data;
    }
  }

  if (safe.email) {
    const { data } = await supabase
      .from("customer_chat_threads")
      .select("id")
      .ilike("email", safe.email)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.id) {
      return data;
    }
  }

  if (safe.phone) {
    const { data } = await supabase
      .from("customer_chat_threads")
      .select("id")
      .eq("phone", safe.phone)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.id) {
      return data;
    }
  }

  return null;
}

async function getOrCreateThread(payload = {}) {
  const supabase = requireSupabase();
  const safe = normalizeFilters(payload);
  const safeName = sanitize(payload.name, "Customer");
  const found = await findExistingThread(safe);

  if (found?.id) {
    return found.id;
  }

  if (!safe.userId && !safe.email && !safe.phone) {
    throw new Error("A user identifier is required.");
  }

  const { data, error } = await supabase
    .from("customer_chat_threads")
    .insert([
      {
        user_id: safe.userId || null,
        name: safeName,
        email: safe.email || null,
        phone: safe.phone || null,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message || "Unable to create chat thread.");
  }

  return data.id;
}

async function touchThread(threadId) {
  const supabase = requireSupabase();
  await supabase
    .from("customer_chat_threads")
    .update({
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", threadId);
}

export async function readCustomerChatMessages(filters = {}) {
  const supabase = requireSupabase();
  const safe = normalizeFilters(filters);

  let query = supabase
    .from("customer_chat_messages")
    .select("id, thread_id, user_id, name, email, phone, sender_role, sender_name, message, attachment, status, created_at")
    .order("created_at", { ascending: true });

  if (safe.userId || safe.email || safe.phone) {
    const clauses = [];
    if (safe.userId) clauses.push(`user_id.eq.${safe.userId}`);
    if (safe.email) clauses.push(`email.ilike.${safe.email}`);
    if (safe.phone) clauses.push(`phone.eq.${safe.phone}`);
    query = query.or(clauses.join(","));
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message || "Unable to load customer chat messages.");
  }

  return (Array.isArray(data) ? data : []).map(toMessageModel);
}

export async function appendCustomerChatMessage(payload = {}) {
  const supabase = requireSupabase();
  const safe = normalizeFilters(payload);
  const safeName = sanitize(payload.name, "Customer");
  const threadId = await getOrCreateThread({
    userId: safe.userId,
    email: safe.email,
    phone: safe.phone,
    name: safeName,
  });

  const senderRole = sanitize(payload.senderRole, "seller");
  const senderName = sanitize(payload.senderName, senderRole === "customer" ? safeName : "Seller");
  const messageText = sanitize(payload.message, "(no text)");
  const attachment = normalizeAttachment(payload.attachment);

  const status = senderRole === "seller" ? "sent" : "received";

  const { data, error } = await supabase
    .from("customer_chat_messages")
    .insert([
      {
        thread_id: threadId,
        user_id: safe.userId || null,
        name: safeName,
        email: safe.email || null,
        phone: safe.phone || null,
        sender_role: senderRole,
        sender_name: senderName,
        message: messageText,
        attachment,
        status,
      },
    ])
    .select("id, thread_id, user_id, name, email, phone, sender_role, sender_name, message, attachment, status, created_at")
    .single();

  if (error) {
    throw new Error(error.message || "Unable to save customer chat message.");
  }

  await touchThread(threadId);
  return toMessageModel(data);
}

export async function markSellerMessagesRead(filters = {}) {
  const supabase = requireSupabase();
  const currentMessages = await readCustomerChatMessages(filters);
  const sellerMessageIds = currentMessages
    .filter((item) => item.senderRole === "seller" && item.status !== "read")
    .map((item) => item.id)
    .filter(Boolean);

  if (sellerMessageIds.length) {
    const { error } = await supabase
      .from("customer_chat_messages")
      .update({ status: "read" })
      .in("id", sellerMessageIds);

    if (error) {
      throw new Error(error.message || "Unable to update message status.");
    }
  }

  return readCustomerChatMessages(filters);
}

export async function deleteCustomerChatMessage(messageId) {
  const safeId = sanitize(messageId);
  if (!safeId) {
    throw new Error("Message ID is required");
  }

  const supabase = requireSupabase();
  const { data: deletedMessage, error } = await supabase
    .from("customer_chat_messages")
    .delete()
    .eq("id", safeId)
    .select("id, thread_id, user_id, name, email, phone, sender_role, sender_name, message, attachment, status, created_at")
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to delete message");
  }

  if (!deletedMessage) {
    throw new Error("Message not found");
  }

  return {
    success: true,
    message: "Message deleted successfully",
    deletedId: safeId,
    deletedMessage: toMessageModel(deletedMessage),
  };
}

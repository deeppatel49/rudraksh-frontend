import { Router } from "express";
import {
  appendCustomerChatMessage,
  markSellerMessagesRead,
  readCustomerChatMessages,
} from "../repositories/customer-chat.repository.js";
import {
  publishCustomerChatEvent,
  registerCustomerChatEventsStream,
} from "../services/customer-chat-events.js";

const router = Router();

router.get("/events", async (req, res) => {
  const filters = {
    userId: req.query.userId,
    email: req.query.email,
    phone: req.query.phone,
  };

  if (!filters.userId && !filters.email && !filters.phone) {
    return res.status(400).json({ error: "A user identifier is required." });
  }

  registerCustomerChatEventsStream({ req, res, filters });
});

router.get("/", async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId,
      email: req.query.email,
      phone: req.query.phone,
    };

    const messages = await readCustomerChatMessages(filters);

    if (String(req.query.markAsRead || "").trim() === "true") {
      const updated = await markSellerMessagesRead(filters);
      return res.json({ messages: updated });
    }

    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Unable to load customer chat messages." });
  }
});

router.post("/", async (req, res) => {
  const payload = req.body || {};
  let message = String(payload.message || "").trim();

  if (payload?.attachment?.url) {
    return res.status(403).json({
      error: "Frontend uploads are disabled. Only backend/admin can upload media.",
    });
  }

  if (!message && !payload.attachment?.url) {
    message = "(no text)";
  }

  if (!payload.userId && !payload.email && !payload.phone) {
    return res.status(400).json({ error: "A user identifier is required." });
  }

  try {
    const createdMessage = await appendCustomerChatMessage({
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      senderRole: payload.senderRole || "seller",
      senderName: payload.senderName || "Seller",
      message,
      attachment: payload.attachment,
    });

    publishCustomerChatEvent("message-created", { item: createdMessage });

    return res.status(201).json({
      message: "Customer chat message saved successfully.",
      item: createdMessage,
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Unable to save customer chat message." });
  }
});

export default router;

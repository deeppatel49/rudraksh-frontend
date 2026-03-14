import { Router } from "express";
import {
  getMessageStatuses,
  listMessageStatusEntries,
  setMessageStatus,
  upsertMessageStatuses,
} from "../repositories/message-status.repository.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rawIds = String(req.query.ids || "").trim();
    const messageId = String(req.query.messageId || "").trim();

    if (messageId) {
      const map = await getMessageStatuses([messageId]);
      return res.json({
        messageId,
        status: map[messageId] || "not-read",
      });
    }

    if (rawIds) {
      const ids = rawIds
        .split(",")
        .map((id) => String(id || "").trim())
        .filter(Boolean);

      const messages = await getMessageStatuses(ids);
      return res.json({ messages });
    }

    const items = await listMessageStatusEntries({
      limit: req.query.limit,
      source: req.query.source,
    });

    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Unable to fetch message statuses." });
  }
});

router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};

    if (Array.isArray(payload.items)) {
      const items = await upsertMessageStatuses(payload.items);
      return res.status(201).json({ items });
    }

    const messageId = String(payload.messageId || "").trim();
    if (!messageId) {
      return res.status(400).json({ error: "messageId is required." });
    }

    const status = await setMessageStatus(messageId, payload.status, {
      source: payload.source,
      updatedBy: payload.updatedBy,
      metadata: payload.metadata,
    });

    return res.status(201).json({ messageId, status });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Unable to save message status." });
  }
});

router.patch("/:messageId", async (req, res) => {
  try {
    const messageId = String(req.params.messageId || "").trim();
    if (!messageId) {
      return res.status(400).json({ error: "messageId is required." });
    }

    const status = await setMessageStatus(messageId, req.body?.status, {
      source: req.body?.source,
      updatedBy: req.body?.updatedBy,
      metadata: req.body?.metadata,
    });

    return res.json({ messageId, status });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Unable to update message status." });
  }
});

export default router;
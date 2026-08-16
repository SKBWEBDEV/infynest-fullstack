import express from "express";

import {
    createSupportMessage,
    getUserConversation,
    getAllSupportMessages,
    adminReplySupport,
    markSupportMessageSeen,
    deleteMessageForUser,
    deleteMessageForAdmin,
} from "../controllers/supportController.js";

const router = express.Router();

// ======================================================
// USER / GUEST
// ======================================================

// Create message
// POST /api/v1/support/messages
router.post(
    "/messages",
    createSupportMessage
);

// Get user's conversation
// GET /api/v1/support/messages/:conversationId
router.get(
    "/messages/:conversationId",
    getUserConversation
);

// ======================================================
// ADMIN
// ======================================================

// Get all support messages
// GET /api/v1/support/messages
router.get(
    "/messages",
    getAllSupportMessages
);

// Admin reply
// POST /api/v1/support/reply
router.post(
    "/reply",
    adminReplySupport
);

// Mark message as seen
// PATCH /api/v1/support/messages/:messageId/seen
router.patch(
    "/messages/:messageId/seen",
    markSupportMessageSeen
);

// ======================================================
// DELETE
// ======================================================

// User delete
// DELETE /api/v1/support/messages/:messageId/user
router.delete(
    "/messages/:messageId/user",
    deleteMessageForUser
);

// Admin delete
// DELETE /api/v1/support/messages/:messageId/admin
router.delete(
    "/messages/:messageId/admin",
    deleteMessageForAdmin
);

export default router;
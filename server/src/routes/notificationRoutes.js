import express from "express";

import {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET notifications
router.get("/", protect, getMyNotifications);

// MARK AS READ
router.put("/:id/read", protect, markAsRead);

// CLEAR ALL
// এটা /:id এর আগে থাকতে হবে
router.delete("/clear/all", protect, clearAllNotifications);

// DELETE SINGLE
router.delete("/:id", protect, deleteNotification);

export default router;
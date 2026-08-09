import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

import {
  protect,
  optionalAuth,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// USER ROUTES
// ==========================================

// Guest + Logged-in দুজনই Order করতে পারবে
router.post("/", optionalAuth, createOrder);

// শুধু Logged-in user নিজের orders দেখতে পারবে
router.get("/myorders", protect, getMyOrders);

router.get("/:id", protect, getOrderById);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all orders
router.get("/", protect, adminOnly, getAllOrders);

// Update order status
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  refundOrder,
} from "../controllers/orderController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// USER ROUTES
// ==========================================

// Create order
router.post("/", protect, createOrder);

// Get my orders
router.get("/myorders", protect, getMyOrders);

// Get single order
router.get("/:id", protect, getOrderById);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all orders
router.get("/", protect, adminOnly, getAllOrders);

// Update order status
router.put(
  "/:id/status",
  protect,
  adminOnly,
  updateOrderStatus,
);

// Refund order
router.post(
  "/:id/refund",
  protect,
  adminOnly,
  refundOrder,
);

export default router;
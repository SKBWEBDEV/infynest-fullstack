import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToDelivered,
  getAllOrders,
  updateOrderStatus, // <--- এটি কন্ট্রোলার থেকে ইমপোর্ট করা নিশ্চিত করবেন
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin Routes
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus); // <--- 'admin' এর বদলে 'adminOnly' হবে

export default router;
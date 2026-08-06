import express from 'express';
import { 
  getMyNotifications, 
  markAsRead, 
  deleteNotification, 
  clearAllNotifications 
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js'; // আপনার প্রজেক্টের অথ মিডলওয়্যার

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);

// ⚠️ '/clear/all' রুটটি অবশ্যই '('/:id')' এর উপরে দিতে হবে
router.delete('/clear/all', protect, clearAllNotifications);

router.delete('/:id', protect, deleteNotification);

export default router;
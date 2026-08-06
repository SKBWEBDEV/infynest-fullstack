import express from 'express';
import { getAllUsers, updateUserRole, deleteUser } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js'; // পাথ তোমার প্রজেক্ট অনুযায়ী ঠিক করে নিও

const router = express.Router();

// সবকটি রুটে যাওয়ার আগে ইউজারকে লগইন করা (protect) এবং এডমিন হওয়া (adminOnly) বাধ্যতামূলক
router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.put('/user/:id/role', updateUserRole);
router.delete('/user/:id', deleteUser);

export const adminRoutes = router;
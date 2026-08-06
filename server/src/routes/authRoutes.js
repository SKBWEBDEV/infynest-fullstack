import express from 'express';
import { 
  register, 
  login, 
  googleLogin, 
  verifyEmail, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/verify-email/:token', verifyEmail);

// নতুন ফোরগট ও রিসেট পাসওয়ার্ড রাউট
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;
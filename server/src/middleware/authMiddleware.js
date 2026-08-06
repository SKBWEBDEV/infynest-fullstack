// File Path: backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// ১. টোকেন ভেরিফাই করার মিডলওয়্যার (Protect)
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// ২. অ্যাডমিন চেক করার মিডلওয়্যার (Admin)
export const admin = (req, res, next) => {
  // কন্ট্রোলারের সাথে মিল রেখে এখানে role === 'admin' চেক করা হলো
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

// adminOnly নাম দিয়েও এক্সপোর্ট করা হলো
export const adminOnly = admin;
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// ==========================================
// PROTECT
// Protected routes-এর জন্য
// ==========================================
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      next();
    } catch (error) {
      console.error("Protect middleware error:", error);

      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

// ==========================================
// OPTIONAL AUTH
// Guest + Logged-in দুই ধরনের order-এর জন্য
// ==========================================
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Token নেই → Guest user
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (user) {
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error("Optional auth error:", error);

    // Invalid token হলেও order creation বন্ধ হবে না
    req.user = null;
    next();
  }
};

// ==========================================
// ADMIN
// ==========================================
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized as an admin",
    });
  }
};

// adminOnly নাম দিয়েও export
export const adminOnly = admin;
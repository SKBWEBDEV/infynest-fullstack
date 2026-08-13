// File Path: backend/routes/bannerRoutes.js

import express from "express";

import {
  getBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ======================================================
// PUBLIC ROUTES
// ======================================================

// Get active banners for HeroSlider
router.get("/active", getActiveBanners);

// Get all banners
router.get("/", getBanners);

// ======================================================
// ADMIN ROUTES
// ======================================================

// Create banner

router.post(
  "/",
  upload.array("images", 5),
  createBanner
);

// Update banner
router.put("/:id", upload.single("image"), updateBanner);

// Delete banner
router.delete("/:id", deleteBanner);

export default router;
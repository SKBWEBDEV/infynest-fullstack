import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import { adminRoutes } from "./src/routes/adminRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import bannerRoutes from "./src/routes/bannerRoutes.js";

dotenv.config();

const app = express();

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://infynest-fullstack.vercel.app",
      "https://infynest-fullstack-git-main-naj-muj-shakibs-projects.vercel.app",
    ],
    credentials: true,
  })
);

// ==========================================
// BODY PARSER
// ==========================================

app.use(express.json({ limit: "16kb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "INFYNEST API is running smoothly",
  });
});

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/products", productRoutes);

app.use("/api/v1/orders", orderRoutes);

app.use("/api/v1/admin", adminRoutes);

app.use("/api/v1/notifications", notificationRoutes);

app.use("/api/v1/banners", bannerRoutes);

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `[Server] INFYNEST Server running on port ${PORT}`
    );
  });
});
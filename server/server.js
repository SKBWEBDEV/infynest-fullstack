import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";

// ======================================================
// ROUTES
// ======================================================

import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import { adminRoutes } from "./src/routes/adminRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import bannerRoutes from "./src/routes/bannerRoutes.js";
import financialRoutes from "./src/routes/financialRoutes.js";
import supportRoutes from "./src/routes/supportMessageRoutes.js";

// ======================================================
// ENVIRONMENT
// ======================================================

dotenv.config();

// ======================================================
// APP
// ======================================================

const app = express();

// ======================================================
// CORS
// ======================================================

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

// ======================================================
// BODY PARSER
// ======================================================

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    status: "OK",
    message: "INFYNEST API is running smoothly",
  });
});

// ======================================================
// API ROUTES
// ======================================================

// AUTH
app.use(
  "/api/v1/auth",
  authRoutes
);

// PRODUCTS
app.use(
  "/api/v1/products",
  productRoutes
);

// ORDERS
app.use(
  "/api/v1/orders",
  orderRoutes
);

// ADMIN
app.use(
  "/api/v1/admin",
  adminRoutes
);

// NOTIFICATIONS
app.use(
  "/api/v1/notifications",
  notificationRoutes
);

// BANNERS
app.use(
  "/api/v1/banners",
  bannerRoutes
);

// FINANCIAL
app.use(
  "/api/v1/financial",
  financialRoutes
);

// SUPPORT
app.use(
  "/api/v1/support",
  supportRoutes
);

// ======================================================
// 404 ROUTE
// ======================================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((error, req, res, next) => {
  console.error(
    "Global server error:",
    error
  );

  return res.status(
    error.statusCode || 500
  ).json({
    success: false,
    message:
      error.message ||
      "Internal server error",
  });
});

// ======================================================
// SERVER
// ======================================================

const PORT =
  process.env.PORT || 8000;

// ======================================================
// DATABASE + SERVER START
// ======================================================

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `[Server] INFYNEST Server running on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "[Server] Database connection failed:",
      error
    );

    process.exit(1);
  });
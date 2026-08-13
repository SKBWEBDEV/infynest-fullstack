// File Path:
// server/src/routes/financialRoutes.js

import express from "express";

import {
  getFinancialDashboard,
  getFinancialTransactions,
  createExpense,
  getExpenses,
} from "../controllers/financialController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router =
  express.Router();

// ==========================================================
// ALL FINANCIAL ROUTES
// ==========================================================
//
// User must:
// 1. Be authenticated
// 2. Have admin permission
//

router.use(protect);
router.use(adminOnly);

// ==========================================================
// FINANCIAL DASHBOARD
// GET /api/v1/financial/dashboard
// ==========================================================

router.get(
  "/dashboard",
  getFinancialDashboard,
);

// ==========================================================
// FINANCIAL TRANSACTIONS
// GET /api/v1/financial/transactions
// ==========================================================

router.get(
  "/transactions",
  getFinancialTransactions,
);

// ==========================================================
// EXPENSES
// GET /api/v1/financial/expenses
// ==========================================================

router.get(
  "/expenses",
  getExpenses,
);

// ==========================================================
// CREATE EXPENSE
// POST /api/v1/financial/expenses
// ==========================================================

router.post(
  "/expenses",
  createExpense,
);

export default router;
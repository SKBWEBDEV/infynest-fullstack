// File Path:
// server/src/controllers/financialController.js

import mongoose from "mongoose";

import {
  FinancialTransaction,
} from "../models/FinancialTransaction.js";

import {
  Expense,
} from "../models/Expense.js";

// ==========================================================
// DATE FILTER HELPER
// ==========================================================

const buildDateFilter = (
  startDate,
  endDate,
) => {
  if (!startDate && !endDate) {
    return null;
  }

  const filter = {};

  if (startDate) {
    const start =
      new Date(startDate);

    if (Number.isNaN(start.getTime())) {
      throw new Error(
        "Invalid start date",
      );
    }

    start.setHours(
      0,
      0,
      0,
      0,
    );

    filter.$gte = start;
  }

  if (endDate) {
    const end =
      new Date(endDate);

    if (Number.isNaN(end.getTime())) {
      throw new Error(
        "Invalid end date",
      );
    }

    end.setHours(
      23,
      59,
      59,
      999,
    );

    filter.$lte = end;
  }

  return filter;
};

// ==========================================================
// GET FINANCIAL DASHBOARD
// GET /api/v1/financial/dashboard
// ==========================================================

export const getFinancialDashboard =
  async (req, res) => {
    try {
      const {
        startDate,
        endDate,
      } = req.query;

      const dateFilter =
        buildDateFilter(
          startDate,
          endDate,
        );

      const match = {};

      if (dateFilter) {
        match.transactionDate =
          dateFilter;
      }

      // ====================================================
      // AGGREGATE DIRECTLY IN MONGODB
      // ====================================================

      const summary =
        await FinancialTransaction.aggregate([
          {
            $match: match,
          },

          {
            $group: {
              _id: "$type",

              total: {
                $sum: "$amount",
              },
            },
          },
        ]);

      // ====================================================
      // MAP RESULTS
      // ====================================================

const totals = {
  income: 0,
  expense: 0,
  product_cost: 0,
  refund: 0,
  payment_fee: 0,
  shipping: 0,
};

      for (
        const item of summary
      ) {
        if (
          Object.prototype.hasOwnProperty.call(
            totals,
            item._id,
          )
        ) {
          totals[item._id] =
            Number(
              item.total || 0,
            );
        }
      }

      // ====================================================
      // TOTAL COST
      // ====================================================

      const totalCosts =
        totals.expense +
        totals.refund +
        totals.payment_fee +
        totals.shipping;

      // ====================================================
      // NET PROFIT
      // ====================================================

      const netProfit =
        totals.income -
        totalCosts;

      // ====================================================
      // PROFIT MARGIN
      // ====================================================

      const profitMargin =
        totals.income > 0
          ? (netProfit /
              totals.income) *
            100
          : 0;

      // ====================================================
      // TRANSACTION COUNT
      // ====================================================

      const transactionCount =
        await FinancialTransaction.countDocuments(
          match,
        );

      // ====================================================
      // RESPONSE
      // ====================================================

      return res.status(200).json({
        success: true,

data: {
  totalIncome:
    totals.income,

  totalExpense:
    totals.expense,

  totalProductCost:
    totals.product_cost,

  totalRefund:
    totals.refund,

  totalPaymentFee:
    totals.payment_fee,

  totalShipping:
    totals.shipping,

  totalCosts,

  netProfit,

  profitMargin:
    Number(
      profitMargin.toFixed(2),
    ),

  transactionCount,
},
      });
    } catch (error) {
      console.error(
        "Get financial dashboard error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to get financial dashboard",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  };

// ==========================================================
// GET ALL FINANCIAL TRANSACTIONS
// GET /api/v1/financial/transactions
// ==========================================================

export const getFinancialTransactions =
  async (req, res) => {
    try {
      const {
        type,
        category,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = req.query;

      const query = {};

      // ====================================================
      // TYPE
      // ====================================================

      if (type) {
        query.type = type;
      }

      // ====================================================
      // CATEGORY
      // ====================================================

      if (category) {
        query.category =
          category;
      }

      // ====================================================
      // DATE
      // ====================================================

      const dateFilter =
        buildDateFilter(
          startDate,
          endDate,
        );

      if (dateFilter) {
        query.transactionDate =
          dateFilter;
      }

      // ====================================================
      // PAGINATION
      // ====================================================

      const currentPage =
        Math.max(
          Number(page) || 1,
          1,
        );

      const perPage =
        Math.min(
          Math.max(
            Number(limit) || 20,
            1,
          ),
          100,
        );

      const skip =
        (currentPage - 1) *
        perPage;

      // ====================================================
      // FETCH
      // ====================================================

      const [
        transactions,
        total,
      ] = await Promise.all([
        FinancialTransaction.find(
          query,
        )
          .populate(
            "order",
            "_id orderStatus totalAmount",
          )
          .populate(
            "createdBy",
            "name email",
          )
          .sort({
            transactionDate: -1,
          })
          .skip(skip)
          .limit(perPage)
          .lean(),

        FinancialTransaction.countDocuments(
          query,
        ),
      ]);

      // ====================================================
      // RESPONSE
      // ====================================================

      return res.status(200).json({
        success: true,

        data: transactions,

        pagination: {
          total,

          page: currentPage,

          limit: perPage,

          totalPages:
            Math.ceil(
              total / perPage,
            ),
        },
      });
    } catch (error) {
      console.error(
        "Get financial transactions error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to get financial transactions",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  };

// ==========================================================
// CREATE EXPENSE
// POST /api/v1/financial/expenses
// ==========================================================

export const createExpense =
  async (req, res) => {
    const session =
      await mongoose.startSession();

    try {
      const {
        title,
        category,
        amount,
        paymentMethod,
        description,
        expenseDate,
        receipt,
      } = req.body;

      // ====================================================
      // VALIDATION
      // ====================================================

      if (
        !title ||
        !String(title).trim()
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Expense title is required",
        });
      }

      const expenseAmount =
        Number(amount);

      if (
        !Number.isFinite(
          expenseAmount,
        ) ||
        expenseAmount <= 0
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Expense amount must be greater than 0",
        });
      }

      // ====================================================
      // DATE
      // ====================================================

      const finalExpenseDate =
        expenseDate
          ? new Date(
              expenseDate,
            )
          : new Date();

      if (
        Number.isNaN(
          finalExpenseDate.getTime(),
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid expense date",
        });
      }

      // ====================================================
      // START TRANSACTION
      // ====================================================

      session.startTransaction();

      // ====================================================
      // CREATE EXPENSE
      // ====================================================

      const expenses =
        await Expense.create(
          [
            {
              title:
                String(
                  title,
                ).trim(),

              category:
                category ||
                "other",

              amount:
                expenseAmount,

              paymentMethod:
                paymentMethod ||
                "other",

              description:
                typeof description ===
                "string"
                  ? description.trim()
                  : "",

              expenseDate:
                finalExpenseDate,

              receipt:
                receipt || null,

              createdBy:
                req.user?._id ||
                null,
            },
          ],
          {
            session,
          },
        );

      const expense =
        expenses[0];

      // ====================================================
      // CREATE FINANCIAL TRANSACTION
      // ====================================================

      await FinancialTransaction.create(
        [
          {
            type: "expense",

            category:
              category || "other",

            title:
              String(
                title,
              ).trim(),

            amount:
              expenseAmount,

            paymentMethod:
              paymentMethod ||
              "other",

            description:
              typeof description ===
              "string"
                ? description.trim()
                : "",

            transactionDate:
              finalExpenseDate,

            createdBy:
              req.user?._id ||
              null,

            isAutomatic: false,
          },
        ],
        {
          session,
        },
      );

      // ====================================================
      // COMMIT
      // ====================================================

      await session.commitTransaction();

      // ====================================================
      // RESPONSE
      // ====================================================

      return res.status(201).json({
        success: true,

        message:
          "Expense created successfully",

        data: expense,
      });
    } catch (error) {
      if (
        session.inTransaction()
      ) {
        await session.abortTransaction();
      }

      console.error(
        "Create expense error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to create expense",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    } finally {
      await session.endSession();
    }
  };

// ==========================================================
// GET ALL EXPENSES
// GET /api/v1/financial/expenses
// ==========================================================

export const getExpenses =
  async (req, res) => {
    try {
      const {
        category,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = req.query;

      const query = {};

      // ====================================================
      // CATEGORY
      // ====================================================

      if (category) {
        query.category =
          category;
      }

      // ====================================================
      // DATE
      // ====================================================

      const dateFilter =
        buildDateFilter(
          startDate,
          endDate,
        );

      if (dateFilter) {
        query.expenseDate =
          dateFilter;
      }

      // ====================================================
      // PAGINATION
      // ====================================================

      const currentPage =
        Math.max(
          Number(page) || 1,
          1,
        );

      const perPage =
        Math.min(
          Math.max(
            Number(limit) || 20,
            1,
          ),
          100,
        );

      const skip =
        (currentPage - 1) *
        perPage;

      // ====================================================
      // FETCH
      // ====================================================

      const [
        expenses,
        total,
      ] = await Promise.all([
        Expense.find(query)
          .populate(
            "createdBy",
            "name email",
          )
          .sort({
            expenseDate: -1,
          })
          .skip(skip)
          .limit(perPage)
          .lean(),

        Expense.countDocuments(
          query,
        ),
      ]);

      // ====================================================
      // RESPONSE
      // ====================================================

      return res.status(200).json({
        success: true,

        data: expenses,

        pagination: {
          total,

          page: currentPage,

          limit: perPage,

          totalPages:
            Math.ceil(
              total / perPage,
            ),
        },
      });
    } catch (error) {
      console.error(
        "Get expenses error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to get expenses",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  };
// File Path:
// server/src/models/FinancialTransaction.js

import mongoose from "mongoose";

// ======================================================
// FINANCIAL TRANSACTION SCHEMA
// ======================================================

const financialTransactionSchema =
  new mongoose.Schema(
    {
      // ==================================================
      // TRANSACTION TYPE
      // ==================================================

      type: {
        type: String,
        enum: [
          "income",
          "expense",
          "shipping",
          "payment_fee",
          "refund",
        ],
        required: true,
        trim: true,
      },

      // ==================================================
      // CATEGORY
      // ==================================================

      category: {
        type: String,
        required: true,
        trim: true,
      },

      // ==================================================
      // TITLE
      // ==================================================

      title: {
        type: String,
        required: true,
        trim: true,
      },

      // ==================================================
      // AMOUNT
      // ==================================================

      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      // ==================================================
      // PAYMENT METHOD
      // ==================================================

      paymentMethod: {
        type: String,
        enum: [
          "cod",
          "bkash",
          "nagad",
          "rocket",
          "card",
          "aamarpay",
          "bank",
          "cash",
          "other",
        ],
        default: "other",
        trim: true,
      },

      // ==================================================
      // TRANSACTION ID
      // ==================================================

      transactionId: {
        type: String,
        default: null,
        trim: true,
      },

      // ==================================================
      // RELATED ORDER
      // ==================================================

      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null,
      },

      // ==================================================
      // DESCRIPTION
      // ==================================================

      description: {
        type: String,
        default: "",
        trim: true,
      },

      // ==================================================
      // TRANSACTION DATE
      // ==================================================

      transactionDate: {
        type: Date,
        default: Date.now,
        required: true,
      },

      // ==================================================
      // CREATED BY
      // ==================================================

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      // ==================================================
      // AUTOMATIC TRANSACTION
      // ==================================================

      isAutomatic: {
        type: Boolean,
        default: true,
      },
    },

    {
      timestamps: true,
    },
  );

// ======================================================
// INDEXES
// ======================================================

// Fast financial report queries
financialTransactionSchema.index({
  transactionDate: -1,
});

// Filter by type
financialTransactionSchema.index({
  type: 1,
  transactionDate: -1,
});

// Filter by category
financialTransactionSchema.index({
  category: 1,
  transactionDate: -1,
});

// Find transactions belonging to an order
financialTransactionSchema.index({
  order: 1,
  transactionDate: -1,
});

// Find transactions created by admin/user
financialTransactionSchema.index({
  createdBy: 1,
  transactionDate: -1,
});

// Payment transaction lookup
financialTransactionSchema.index({
  transactionId: 1,
});

// ======================================================
// PREVENT DUPLICATE AUTOMATIC ORDER TRANSACTIONS
// ======================================================
//
// One order can have:
// income       -> only once
// shipping     -> only once
// payment_fee  -> only once
//
// Refund is intentionally NOT included here because
// one order can have multiple refunds.
//

financialTransactionSchema.index(
  {
    order: 1,
    type: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      type: {
        $in: [
          "income",
          "shipping",
          "payment_fee",
        ],
      },

      order: {
        $type: "objectId",
      },
    },
  },
);

// ======================================================
// MODEL
// ======================================================

export const FinancialTransaction =
  mongoose.model(
    "FinancialTransaction",
    financialTransactionSchema,
  );
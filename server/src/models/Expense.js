import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    // ======================================================
    // TITLE
    // ======================================================

    title: {
      type: String,

      required: true,

      trim: true,
    },

    // ======================================================
    // CATEGORY
    // ======================================================

    category: {
      type: String,

      enum: [
        "product_purchase",
        "shipping",
        "marketing",
        "salary",
        "hosting",
        "domain",
        "packaging",
        "maintenance",
        "office",
        "other",
      ],

      default: "other",
    },

    // ======================================================
    // AMOUNT
    // ======================================================

    amount: {
      type: Number,

      required: true,

      min: 0,
    },

    // ======================================================
    // PAYMENT METHOD
    // ======================================================

    paymentMethod: {
      type: String,

      enum: [
        "cash",
        "bkash",
        "nagad",
        "rocket",
        "card",
        "bank",
        "other",
      ],

      default: "other",
    },

    // ======================================================
    // DESCRIPTION
    // ======================================================

    description: {
      type: String,

      trim: true,

      default: "",
    },

    // ======================================================
    // EXPENSE DATE
    // ======================================================

    expenseDate: {
      type: Date,

      default: Date.now,
    },

    // ======================================================
    // RECEIPT
    // ======================================================

    receipt: {
      type: String,

      trim: true,

      default: null,
    },

    // ======================================================
    // CREATED BY
    // ======================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      default: null,
    },
  },

  {
    timestamps: true,
  },
);

// ==========================================================
// INDEXES
// ==========================================================

expenseSchema.index({
  expenseDate: -1,
});

expenseSchema.index({
  category: 1,
  expenseDate: -1,
});

// ==========================================================
// MODEL
// ==========================================================

export const Expense = mongoose.model(
  "Expense",
  expenseSchema,
);
// File Path:
// server/src/models/Order.js

import mongoose from "mongoose";

// ======================================================
// ORDER ITEM SCHEMA
// ======================================================

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    costPrice: {
  type: Number,
  default: 0,
  min: 0,
},

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    size: {
      type: String,
      default: "N/A",
      trim: true,
    },

    color: {
      type: String,
      default: "N/A",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

// ======================================================
// ORDER SCHEMA
// ======================================================

const orderSchema = new mongoose.Schema(
  {
    // ==================================================
    // USER
    // ==================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==================================================
    // CUSTOMER INFORMATION
    // ==================================================

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // ==================================================
    // SHIPPING INFORMATION
    // ==================================================

    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },

    deliveryArea: {
      type: String,
      enum: [
        "Inside Dhaka",
        "Outside Dhaka",
      ],
      required: true,
      trim: true,
    },

    shippingFee: {
      type: Number,
      required: true,
      default: 100,
      min: 0,
    },

    // ==================================================
    // ORDER ITEMS
    // ==================================================

    orderItems: {
      type: [orderItemSchema],

      required: true,

      validate: {
        validator: (items) =>
          Array.isArray(items) &&
          items.length > 0,

        message:
          "Order must contain at least one item",
      },
    },

    // ==================================================
    // PAYMENT INFORMATION
    // ==================================================

    paymentMethod: {
      type: String,

      enum: [
        "Cash on Delivery",
        "bKash",
        "Nagad",
        "Rocket",
        "Card",
        "AamarPay",
        "Bank",
        "Other",
      ],

      default: "Cash on Delivery",

      required: true,

      trim: true,
    },

    senderNumber: {
      type: String,
      default: "",
      trim: true,
    },

    transactionId: {
      type: String,
      default: "",
      trim: true,
    },

    paymentStatus: {
      type: String,

      enum: [
        "Pending",
        "Paid",
        "Failed",
        "Refunded",
        "Partially Refunded",
      ],

      default: "Pending",

      required: true,
    },

    isPaid: {
      type: Boolean,

      default: false,
    },

    paidAt: {
      type: Date,

      default: null,
    },

    // ==================================================
    // PRICE INFORMATION
    // ==================================================

    subtotal: {
      type: Number,

      required: true,

      min: 0,
    },

    totalAmount: {
      type: Number,

      required: true,

      min: 0,
    },

    // ==================================================
    // FINANCIAL INFORMATION
    // ==================================================

    paymentFee: {
      type: Number,

      default: 0,

      min: 0,
    },

    // ==================================================
    // REFUND INFORMATION
    // ==================================================

    refundedAmount: {
      type: Number,

      default: 0,

      min: 0,
    },

    // ==================================================
    // ORDER STATUS
    // ==================================================

    orderStatus: {
      type: String,

      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],

      default: "Pending",

      required: true,
    },

    // ==================================================
    // CANCELLATION
    // ==================================================

    cancelledAt: {
      type: Date,

      default: null,
    },

    cancellationReason: {
      type: String,

      default: "",

      trim: true,
    },
  },

  {
    timestamps: true,
  },
);

// ======================================================
// INDEXES
// ======================================================

orderSchema.index({
  createdAt: -1,
});

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  orderStatus: 1,
  createdAt: -1,
});

orderSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

orderSchema.index({
  transactionId: 1,
});

// ======================================================
// MODEL
// ======================================================

export const Order = mongoose.model(
  "Order",
  orderSchema,
);
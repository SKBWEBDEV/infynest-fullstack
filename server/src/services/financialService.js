// File Path:
// server/src/services/financialService.js

import { FinancialTransaction } from "../models/FinancialTransaction.js";

// ==========================================================
// PAYMENT METHOD MAP
// ==========================================================

const PAYMENT_METHOD_MAP = {
  "Cash on Delivery": "cod",

  bKash: "bkash",
  BKash: "bkash",
  bkash: "bkash",

  Nagad: "nagad",
  nagad: "nagad",

  Rocket: "rocket",
  rocket: "rocket",

  Card: "card",
  card: "card",

  AamarPay: "aamarpay",
  aamarpay: "aamarpay",

  Bank: "bank",
  bank: "bank",

  Cash: "cash",
  cash: "cash",

  Other: "other",
  other: "other",
};

// ==========================================================
// NORMALIZE PAYMENT METHOD
// ==========================================================

export const normalizePaymentMethod = (
  paymentMethod,
) => {
  if (!paymentMethod) {
    return "other";
  }

  const value = String(paymentMethod).trim();

  return (
    PAYMENT_METHOD_MAP[value] ||
    value.toLowerCase()
  );
};

// ==========================================================
// VALIDATE AMOUNT
// ==========================================================

const validateAmount = (amount) => {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Financial transaction amount must be greater than 0",
    );
  }

  return numericAmount;
};

// ==========================================================
// CREATE FINANCIAL TRANSACTION
// ==========================================================

export const createFinancialTransaction = async ({
  type,
  category,
  title,
  amount,
  paymentMethod = "other",
  transactionId = null,
  order = null,
  description = "",
  transactionDate = new Date(),
  createdBy = null,
  isAutomatic = true,
  session = null,
}) => {
  if (!type) {
    throw new Error(
      "Financial transaction type is required",
    );
  }

  if (!category) {
    throw new Error(
      "Financial transaction category is required",
    );
  }

  if (!title) {
    throw new Error(
      "Financial transaction title is required",
    );
  }

  const transactionAmount =
    validateAmount(amount);

  const transactionData = {
    type,

    category,

    title: String(title).trim(),

    amount: transactionAmount,

    paymentMethod:
      normalizePaymentMethod(
        paymentMethod,
      ),

    transactionId:
      transactionId
        ? String(transactionId).trim()
        : null,

    order,

    description:
      typeof description === "string"
        ? description.trim()
        : "",

    transactionDate,

    createdBy,

    isAutomatic,
  };

  const documents =
    await FinancialTransaction.create(
      [transactionData],

      session
        ? {
            session,
          }
        : undefined,
    );

  return documents[0];
};

// ==========================================================
// CHECK TRANSACTION EXISTS
// ==========================================================

export const transactionExists = async ({
  orderId,
  type,
  session = null,
}) => {
  if (!orderId || !type) {
    return false;
  }

  const query =
    FinancialTransaction.exists({
      order: orderId,
      type,
    });

  if (session) {
    query.session(session);
  }

  return await query;
};

// ==========================================================
// CREATE ORDER INCOME
// ==========================================================

export const createOrderIncome = async ({
  order,
  createdBy = null,
  session = null,
}) => {
  if (!order?._id) {
    throw new Error(
      "Order is required to create income",
    );
  }

  const amount = Number(
    order.totalAmount || 0,
  );

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Invalid order amount for financial income",
    );
  }

  const existing =
    await transactionExists({
      orderId: order._id,
      type: "income",
      session,
    });

  if (existing) {
    return null;
  }

  try {
    return await createFinancialTransaction({
      type: "income",

      category: "sales",

      title: `Order Income #${order._id}`,

      amount,

      paymentMethod:
        normalizePaymentMethod(
          order.paymentMethod,
        ),

      transactionId:
        order.transactionId || null,

      order: order._id,

      description:
        `Income generated from delivered order #${order._id}`,

      transactionDate:
        order.paidAt || new Date(),

      createdBy,

      isAutomatic: true,

      session,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return null;
    }

    throw error;
  }
};

// ==========================================================
// CREATE SHIPPING COST
// ==========================================================

export const createShippingCost = async ({
  order,
  amount,
  createdBy = null,
  session = null,
}) => {
  if (!order?._id) {
    throw new Error(
      "Order is required to create shipping cost",
    );
  }

  const shippingAmount = Number(amount);

  if (
    !Number.isFinite(shippingAmount) ||
    shippingAmount <= 0
  ) {
    return null;
  }

  const existing =
    await transactionExists({
      orderId: order._id,
      type: "shipping",
      session,
    });

  if (existing) {
    return null;
  }

  try {
    return await createFinancialTransaction({
      type: "shipping",

      category: "delivery",

      title: `Shipping Cost #${order._id}`,

      amount: shippingAmount,

      paymentMethod: "other",

      order: order._id,

      description:
        `Shipping cost for order #${order._id}`,

      transactionDate: new Date(),

      createdBy,

      isAutomatic: true,

      session,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return null;
    }

    throw error;
  }
};

// ==========================================================
// CREATE PAYMENT FEE
// ==========================================================

export const createPaymentFee = async ({
  order,
  amount,
  createdBy = null,
  session = null,
}) => {
  if (!order?._id) {
    throw new Error(
      "Order is required to create payment fee",
    );
  }

  const fee = Number(amount);

  if (
    !Number.isFinite(fee) ||
    fee <= 0
  ) {
    return null;
  }

  const existing =
    await transactionExists({
      orderId: order._id,
      type: "payment_fee",
      session,
    });

  if (existing) {
    return null;
  }

  try {
    return await createFinancialTransaction({
      type: "payment_fee",

      category: "payment_gateway",

      title: `Payment Fee #${order._id}`,

      amount: fee,

      paymentMethod:
        normalizePaymentMethod(
          order.paymentMethod,
        ),

      transactionId:
        order.transactionId || null,

      order: order._id,

      description:
        `Payment gateway fee for order #${order._id}`,

      transactionDate:
        order.paidAt || new Date(),

      createdBy,

      isAutomatic: true,

      session,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return null;
    }

    throw error;
  }
};

// ==========================================================
// CREATE ORDER REFUND
// ==========================================================
//
// Multiple refunds are allowed for the same order.
// ==========================================================

export const createOrderRefund = async ({
  order,
  amount,
  createdBy = null,
  session = null,
}) => {
  if (!order?._id) {
    throw new Error(
      "Order is required to create refund",
    );
  }

  const refundAmount =
    validateAmount(amount);

  return await createFinancialTransaction({
    type: "refund",

    category: "customer_refund",

    title: `Refund #${order._id}`,

    amount: refundAmount,

    paymentMethod:
      normalizePaymentMethod(
        order.paymentMethod,
      ),

    transactionId:
      order.transactionId || null,

    order: order._id,

    description:
      `Refund issued for order #${order._id}`,

    transactionDate: new Date(),

    createdBy,

    isAutomatic: true,

    session,
  });
};
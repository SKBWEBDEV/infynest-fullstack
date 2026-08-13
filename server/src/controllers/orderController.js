// File Path:
// server/src/controllers/orderController.js

import mongoose from "mongoose";

import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Notification } from "../models/Notification.js";

import {
  createOrderIncome,
  createProductCost,
  createShippingCost,
  createPaymentFee,
  createOrderRefund,
} from "../services/financialService.js";

// ======================================================
// PAYMENT METHOD MAP
// ======================================================

const PAYMENT_METHOD_MAP = {
  "Cash on Delivery": "cod",
  bKash: "bkash",
  Nagad: "nagad",
  Rocket: "rocket",
  Card: "card",
  AamarPay: "aamarpay",
  Bank: "bank",
  Other: "other",
};

// ======================================================
// NORMALIZE PAYMENT METHOD
// ======================================================

const normalizePaymentMethod = (
  paymentMethod,
) => {
  if (!paymentMethod) {
    return "other";
  }

  return (
    PAYMENT_METHOD_MAP[paymentMethod] ||
    String(paymentMethod)
      .trim()
      .toLowerCase()
  );
};

// ======================================================
// CHECK COD
// ======================================================

const isCOD = (paymentMethod) =>
  paymentMethod === "Cash on Delivery";

// ======================================================
// CREATE ORDER NOTIFICATION
// ======================================================

const createOrderNotification = async ({
  user,
  title,
  message,
}) => {
  if (!user) {
    return;
  }

  try {
    await Notification.create({
      user,
      title,
      message,
      type: "order",
      isRead: false,
    });
  } catch (error) {
    console.error(
      "Order notification creation error:",
      error,
    );
  }
};

// ======================================================
// CREATE ORDER
// POST /api/v1/orders
// ======================================================

export const createOrder = async (
  req,
  res,
) => {
  try {
    const {
      orderItems,
      shippingAddress,
      phone,
      customerName,
      email,
      deliveryArea,
      paymentMethod,
      senderNumber,
      transactionId,
      shippingFee,
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !Array.isArray(orderItems) ||
      orderItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No order items",
      });
    }

    if (
      !customerName ||
      !String(customerName).trim() ||
      !email ||
      !String(email).trim() ||
      !phone ||
      !String(phone).trim() ||
      !shippingAddress
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone and shipping address are required",
      });
    }

    if (
      ![
        "Inside Dhaka",
        "Outside Dhaka",
      ].includes(deliveryArea)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery area",
      });
    }

    // ==================================================
    // PHONE VALIDATION
    // ==================================================

    const phoneValue = String(phone).trim();

    const phoneRegex = /^01[0-9]{9}$/;

    if (!phoneRegex.test(phoneValue)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 11-digit Bangladesh mobile number starting with 01",
      });
    }

    // ==================================================
    // PAYMENT METHOD
    // ==================================================

    const finalPaymentMethod =
      paymentMethod ||
      "Cash on Delivery";

    const allowedPaymentMethods = [
      "Cash on Delivery",
      "bKash",
      "Nagad",
      "Rocket",
      "Card",
      "AamarPay",
      "Bank",
      "Other",
    ];

    if (
      !allowedPaymentMethods.includes(
        finalPaymentMethod,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const cashOnDelivery =
      isCOD(finalPaymentMethod);

    // ==================================================
    // ONLINE PAYMENT VALIDATION
    // ==================================================

    if (!cashOnDelivery) {
      if (
        !transactionId ||
        !String(transactionId).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Transaction ID is required for online payment",
        });
      }
    }

    // ==================================================
    // PROCESS ORDER ITEMS
    // ==================================================

    let subtotal = 0;

    const processedOrderItems = [];

    for (const item of orderItems) {
      const productId =
        item.product ||
        item.productId;

      // -----------------------------------------------
      // PRODUCT ID
      // -----------------------------------------------

      if (!productId) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is missing",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          productId,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
        });
      }

      // -----------------------------------------------
      // PRODUCT
      // -----------------------------------------------

      const product =
        await Product.findById(
          productId,
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // -----------------------------------------------
      // QUANTITY
      // -----------------------------------------------

      const quantity =
        Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product quantity must be at least 1",
        });
      }

      // -----------------------------------------------
      // STOCK
      // -----------------------------------------------

      const availableStock =
        Number(product.stock || 0);

      if (
        availableStock < quantity
      ) {
        return res.status(400).json({
          success: false,
          message: `${
            product.name ||
            product.title ||
            "Product"
          } has insufficient stock`,
        });
      }

      // -----------------------------------------------
      // PRICE
      // -----------------------------------------------

      const price =
        Number(item.price) ||
        Number(product.discountPrice) ||
        Number(product.retailPrice) ||
        Number(product.price) ||
        0;

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for product: ${
            product.name ||
            product.title ||
            "Product"
          }`,
        });
      }

      // -----------------------------------------------
      // ITEM TOTAL
      // -----------------------------------------------

      const itemTotal =
        price * quantity;

      subtotal += itemTotal;

      // -----------------------------------------------
      // SNAPSHOT
      // -----------------------------------------------

processedOrderItems.push({
  product: product._id,

  name:
    item.name ||
    product.name ||
    product.title ||
    "Product",

  image:
    item.image ||
    product.images?.[0] ||
    product.image ||
    "",

  // Customer-এর selling price
  price,

  // Business-এর actual product cost
  costPrice: Number(
    product.costPrice || 0,
  ),

  quantity,

  size:
    item.size ||
    item.selectedSize ||
    "N/A",

  color:
    item.color ||
    item.selectedColor ||
    "N/A",
});
    }

    // ==================================================
    // SHIPPING FEE
    // ==================================================

    const deliveryFee =
      shippingFee !== undefined
        ? Number(shippingFee)
        : deliveryArea ===
          "Inside Dhaka"
        ? 80
        : 120;

    if (
      !Number.isFinite(
        deliveryFee,
      ) ||
      deliveryFee < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid shipping fee",
      });
    }

    // ==================================================
    // TOTAL
    // ==================================================

    const totalAmount =
      subtotal + deliveryFee;

    if (
      !Number.isFinite(
        totalAmount,
      ) ||
      totalAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order total",
      });
    }

    // ==================================================
    // SHIPPING ADDRESS
    // ==================================================

    const finalShippingAddress =
      typeof shippingAddress ===
      "object"
        ? [
            shippingAddress.street,
            shippingAddress.city,
            shippingAddress.district,
          ]
            .filter(Boolean)
            .join(", ")
        : String(
            shippingAddress,
          ).trim();

    if (!finalShippingAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Shipping address is required",
      });
    }

    // ==================================================
    // CREATE ORDER
    // ==================================================

    const order =
      await Order.create({
        user:
          req.user?._id || null,

        customerName:
          String(
            customerName,
          ).trim(),

        email:
          String(email)
            .trim()
            .toLowerCase(),

        phone: phoneValue,

        deliveryArea,

        shippingAddress:
          finalShippingAddress,

        orderItems:
          processedOrderItems,

        paymentMethod:
          finalPaymentMethod,

        senderNumber:
          cashOnDelivery
            ? ""
            : String(
                senderNumber || "",
              ).trim(),

        transactionId:
          cashOnDelivery
            ? ""
            : String(
                transactionId || "",
              ).trim(),

        paymentStatus:
          "Pending",

        isPaid: false,

        paidAt: null,

        subtotal,

        shippingFee:
          deliveryFee,

        totalAmount,

        paymentFee: 0,

        orderStatus:
          "Pending",
      });

    // ==================================================
    // NOTIFICATION
    // ==================================================

    await createOrderNotification({
      user: order.user,

      title:
        "Order Placed",

      message:
        `Your order #${order._id} has been placed successfully.`,
    });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        "Order created successfully",

      data: order,
    });
  } catch (error) {
    console.error(
      "Order creation error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create order",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

// ======================================================
// GET MY ORDERS
// GET /api/v1/orders/myorders
// ======================================================

export const getMyOrders = async (
  req,
  res,
) => {
  try {
    const orders =
      await Order.find({
        user: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,

      count: orders.length,

      data: orders,
    });
  } catch (error) {
    console.error(
      "Get my orders error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to get orders",
    });
  }
};

// ======================================================
// GET SINGLE ORDER
// GET /api/v1/orders/:id
// ======================================================

export const getOrderById =
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id,
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order ID",
        });
      }

      const order =
        await Order.findById(
          req.params.id,
        ).populate(
          "user",
          "name email",
        );

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found",
        });
      }

      return res.status(200).json({
        success: true,

        data: order,
      });
    } catch (error) {
      console.error(
        "Get order error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to get order",
      });
    }
  };

// ======================================================
// UPDATE ORDER STATUS
// PUT /api/v1/orders/:id/status
// ======================================================

export const updateOrderStatus =
  async (req, res) => {
    const session =
      await mongoose.startSession();

    try {
      const { status } =
        req.body;

      // ==================================================
      // STATUS VALIDATION
      // ==================================================

      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      if (
        !allowedStatuses.includes(
          status,
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order status",
        });
      }

      // ==================================================
      // ORDER ID
      // ==================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id,
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order ID",
        });
      }

      // ==================================================
      // START TRANSACTION
      // ==================================================

      session.startTransaction();

      // ==================================================
      // FIND ORDER
      // ==================================================

      const order =
        await Order.findById(
          req.params.id,
        ).session(session);

      if (!order) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,

          message:
            "Order not found",
        });
      }

      // ==================================================
      // OLD STATUS
      // ==================================================

      const oldStatus =
        order.orderStatus;

      // ==================================================
      // SAME STATUS
      // ==================================================

      if (
        oldStatus === status
      ) {
        await session.abortTransaction();

        return res.status(200).json({
          success: true,

          message:
            `Order is already ${status}`,

          data: order,
        });
      }

      // ==================================================
      // INVALID TRANSITION
      // ==================================================

      if (
        oldStatus ===
          "Delivered" &&
        status ===
          "Cancelled"
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,

          message:
            "A delivered order cannot be cancelled",
        });
      }

      // ==================================================
      // UPDATE STATUS
      // ==================================================

      order.orderStatus =
        status;

      // ==================================================
      // COD PAYMENT ON DELIVERY
      // ==================================================

      if (
        status ===
          "Delivered" &&
        isCOD(
          order.paymentMethod,
        )
      ) {
        order.isPaid = true;

        order.paymentStatus =
          "Paid";

        order.paidAt =
          order.paidAt ||
          new Date();
      }

      // ==================================================
      // SAVE ORDER
      // ==================================================

      const updatedOrder =
        await order.save({
          session,
        });

      // ==================================================
      // FINANCIAL TRANSACTIONS
      // ==================================================

      if (
        oldStatus !==
          "Delivered" &&
        status ===
          "Delivered" &&
        updatedOrder.isPaid ===
          true
      ) {
        // ----------------------------------------------
        // INCOME
        // ----------------------------------------------

        await createOrderIncome({
          order:
            updatedOrder,

          createdBy:
            req.user?._id ||
            null,

          session,
        });

        // ----------------------------------------------
// PRODUCT COST
// ----------------------------------------------

await createProductCost({
  order: updatedOrder,

  createdBy:
    req.user?._id ||
    null,

  session,
});

        // ----------------------------------------------
        // SHIPPING COST
        //
        // এখানে actual courier cost ব্যবহার করা উচিত।
        // বর্তমানে shippingFee customer-এর charged fee,
        // তাই automatically cost হিসেবে ধরা হচ্ছে না।
        // ----------------------------------------------

        /*
        await createShippingCost({
          order: updatedOrder,
          amount: ACTUAL_COURIER_COST,
          createdBy: req.user?._id || null,
          session,
        });
        */

        // ----------------------------------------------
        // PAYMENT FEE
        //
        // যদি gateway fee জানা থাকে তখন create করবে।
        // ----------------------------------------------

        /*
        await createPaymentFee({
          order: updatedOrder,
          amount: PAYMENT_GATEWAY_FEE,
          createdBy: req.user?._id || null,
          session,
        });
        */
      }

      // ==================================================
      // CANCELLED ORDER
      // ==================================================

      if (
        status ===
          "Cancelled" &&
        oldStatus !==
          "Cancelled"
      ) {
        updatedOrder.cancelledAt =
          new Date();

        await updatedOrder.save({
          session,
        });
      }

      // ==================================================
      // COMMIT
      // ==================================================

      await session.commitTransaction();

      // ==================================================
      // NOTIFICATION
      // ==================================================

      await createOrderNotification({
        user:
          updatedOrder.user,

        title:
          "Order Status Updated",

        message:
          `Your order #${updatedOrder._id} has been ${status.toLowerCase()}.`,
      });

      // ==================================================
      // RESPONSE
      // ==================================================

      return res.status(200).json({
        success: true,

        message:
          `Order status updated to ${status}`,

        data:
          updatedOrder,
      });
    } catch (error) {
      if (
        session.inTransaction()
      ) {
        await session.abortTransaction();
      }

      // Duplicate transaction
      if (
        error?.code === 11000
      ) {
        console.error(
          "Duplicate financial transaction:",
          error,
        );

        return res.status(409).json({
          success: false,

          message:
            "Financial transaction already exists for this order",
        });
      }

      console.error(
        "Update order status error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to update order status",

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

// ======================================================
// REFUND ORDER
// POST /api/v1/orders/:id/refund
// ======================================================

export const refundOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { amount } = req.body;

    // ==================================================
    // VALIDATE ORDER ID
    // ==================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // ==================================================
    // VALIDATE AMOUNT
    // ==================================================

    const refundAmount = Number(amount);

    if (
      !Number.isFinite(refundAmount) ||
      refundAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Refund amount must be greater than 0",
      });
    }

    // ==================================================
    // START TRANSACTION
    // ==================================================

    session.startTransaction();

    // ==================================================
    // FIND ORDER
    // ==================================================

    const order = await Order.findById(
      req.params.id,
    ).session(session);

    if (!order) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==================================================
    // CHECK PAYMENT
    // ==================================================

    if (!order.isPaid) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Only paid orders can be refunded",
      });
    }

    // ==================================================
    // EXISTING REFUND AMOUNT
    // ==================================================

    const existingRefundAmount = Number(
      order.refundedAmount || 0,
    );

    // ==================================================
    // TOTAL REFUNDED AMOUNT CANNOT EXCEED ORDER TOTAL
    // ==================================================

    const orderTotal = Number(
      order.totalAmount || 0,
    );

    const remainingRefundable =
      orderTotal - existingRefundAmount;

    if (remainingRefundable <= 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "This order has already been fully refunded",
      });
    }

    // ==================================================
    // CHECK REFUND AMOUNT
    // ==================================================

    if (
      refundAmount >
      remainingRefundable
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: `Maximum refundable amount is ৳${remainingRefundable}`,
      });
    }

    // ==================================================
    // CREATE REFUND FINANCIAL TRANSACTION
    // ==================================================

    await createOrderRefund({
      order,

      amount: refundAmount,

      createdBy:
        req.user?._id || null,

      session,
    });

    // ==================================================
    // UPDATE REFUNDED AMOUNT
    // ==================================================

    order.refundedAmount =
      existingRefundAmount +
      refundAmount;

    // ==================================================
    // UPDATE PAYMENT STATUS
    // ==================================================

    if (
      order.refundedAmount >=
      orderTotal
    ) {
      order.paymentStatus =
        "Refunded";
    } else {
      order.paymentStatus =
        "Partially Refunded";
    }

    // ==================================================
    // SAVE ORDER
    // ==================================================

    await order.save({
      session,
    });

    // ==================================================
    // COMMIT TRANSACTION
    // ==================================================

    await session.commitTransaction();

    // ==================================================
    // NOTIFICATION
    // ==================================================

    await createOrderNotification({
      user: order.user,

      title: "Refund Processed",

      message:
        `A refund of ৳${refundAmount} has been processed for order #${order._id}.`,
    });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        "Refund processed successfully",

      data: order,
    });
  } catch (error) {
    // ==================================================
    // ABORT TRANSACTION ON ERROR
    // ==================================================

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Refund order error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to process refund",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  } finally {
    // ==================================================
    // END SESSION
    // ==================================================

    await session.endSession();
  }
};

// ======================================================
// GET ALL ORDERS
// GET /api/v1/orders
// ======================================================

export const getAllOrders =
  async (req, res) => {
    try {
      const orders =
        await Order.find({})
          .populate(
            "user",
            "name email",
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,

        count:
          orders.length,

        data: orders,
      });
    } catch (error) {
      console.error(
        "Get all orders error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to get orders",
      });
    }
  };
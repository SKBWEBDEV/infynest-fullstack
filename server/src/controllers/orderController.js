
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
// SEND ORDER STATUS TO N8N
// ======================================================

const sendOrderStatusToN8N = async (order) => {
  try {
    const webhookUrl =
      process.env.N8N_ORDER_STATUS_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn(
        "N8N_ORDER_STATUS_WEBHOOK_URL is not configured"
      );
      return;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        orderId: order._id.toString(),

        orderStatus: order.orderStatus,

        customerName: order.customerName,

        email: order.email,

        phone: order.phone,

        deliveryArea: order.deliveryArea,

        shippingAddress: order.shippingAddress,

        paymentMethod: order.paymentMethod,

        paymentStatus: order.paymentStatus,

        subtotal: order.subtotal,

        shippingFee: order.shippingFee,

        totalAmount: order.totalAmount,

        createdAt: order.createdAt,

        updatedAt: order.updatedAt,
      }),
    });

    if (!response.ok) {
      console.error(
        "n8n webhook failed:",
        response.status,
        response.statusText
      );

      return;
    }

    console.log(
      `[n8n] Order status webhook sent successfully for order ${order._id}`
    );
  } catch (error) {
    console.error(
      "[n8n] Failed to send order status webhook:",
      error.message
    );
  }
};

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
// ALLOWED PAYMENT METHODS
// ======================================================

const ALLOWED_PAYMENT_METHODS = [
  "Cash on Delivery",
  "bKash",
  "Nagad",
  "Rocket",
  "Card",
  "AamarPay",
  "Bank",
  "Other",
];

// ======================================================
// ALLOWED ORDER STATUSES
// ======================================================

const ALLOWED_ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

// ======================================================
// STATUS TRANSITIONS
// ======================================================

const ALLOWED_STATUS_TRANSITIONS = {
  Pending: ["Confirmed", "Cancelled"],

  Confirmed: ["Processing", "Cancelled"],

  Processing: ["Shipped", "Cancelled"],

  Shipped: ["Delivered", "Cancelled"],

  Delivered: [],

  Cancelled: [],
};

// ======================================================
// NORMALIZE PAYMENT METHOD
// ======================================================

const normalizePaymentMethod = (paymentMethod) => {
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

const isCOD = (paymentMethod) => {
  return paymentMethod === "Cash on Delivery";
};

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
      error
    );
  }
};

// ======================================================
// GET SERVER SELLING PRICE
// ======================================================

const getProductSellingPrice = (product) => {
  const possiblePrices = [
    product.discountPrice,
    product.retailPrice,
    product.price,
  ];

  for (const value of possiblePrices) {
    const price = Number(value);

    if (
      Number.isFinite(price) &&
      price > 0
    ) {
      return price;
    }
  }

  return 0;
};

// ======================================================
// GET PRODUCT NAME
// ======================================================

const getProductName = (product) => {
  return (
    product.name ||
    product.title ||
    "Product"
  );
};

// ======================================================
// CREATE ORDER
// POST /api/v1/orders
// ======================================================

export const createOrder = async (
  req,
  res
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

    // ==================================================
    // DELIVERY AREA
    // ==================================================

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
    // PHONE
    // ==================================================

    const phoneValue =
      String(phone).trim();

    const phoneRegex =
      /^01[0-9]{9}$/;

    if (!phoneRegex.test(phoneValue)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 11-digit Bangladesh mobile number starting with 01",
      });
    }

    // ==================================================
    // EMAIL
    // ==================================================

    const emailValue =
      String(email)
        .trim()
        .toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailValue)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address",
      });
    }

    // ==================================================
    // PAYMENT METHOD
    // ==================================================

    const finalPaymentMethod =
      paymentMethod ||
      "Cash on Delivery";

    if (
      !ALLOWED_PAYMENT_METHODS.includes(
        finalPaymentMethod
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
    // ONLINE PAYMENT
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
        : String(shippingAddress).trim();

    if (!finalShippingAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Shipping address is required",
      });
    }

    // ==================================================
    // PROCESS ORDER ITEMS
    // ==================================================

    let subtotal = 0;

    const processedOrderItems = [];

    const requestedQuantities =
      new Map();

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
          productId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
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
      // DUPLICATE PRODUCT
      // -----------------------------------------------

      const productKey =
        String(productId);

      const previousQuantity =
        requestedQuantities.get(
          productKey
        ) || 0;

      const totalRequestedQuantity =
        previousQuantity +
        quantity;

      requestedQuantities.set(
        productKey,
        totalRequestedQuantity
      );

      // -----------------------------------------------
      // PRODUCT
      // -----------------------------------------------

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // -----------------------------------------------
      // STOCK VALIDATION
      // -----------------------------------------------

      const availableStock =
        Number(product.stock || 0);

      if (
        availableStock <
        totalRequestedQuantity
      ) {
        return res.status(400).json({
          success: false,
          message: `${getProductName(
            product
          )} has insufficient stock. Available: ${availableStock}, Required: ${totalRequestedQuantity}`,
        });
      }

      // -----------------------------------------------
      // SERVER PRICE
      // -----------------------------------------------

      const price =
        getProductSellingPrice(
          product
        );

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for product: ${getProductName(
            product
          )}`,
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

        name: getProductName(product),

        image:
          item.image ||
          product.images?.find(
            (image) =>
              image?.isMain
          )?.url ||
          product.images?.[0]?.url ||
          product.images?.[0] ||
          product.image ||
          "",

        price,

        costPrice: Number(
          product.costPrice || 0
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
    // SHIPPING
    // ==================================================

    const deliveryFee =
      deliveryArea ===
        "Inside Dhaka"
        ? 80
        : 120;

    // ==================================================
    // TOTAL
    // ==================================================

    const totalAmount =
      subtotal + deliveryFee;

    if (
      !Number.isFinite(subtotal) ||
      subtotal <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order subtotal",
      });
    }

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order total",
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
          String(customerName).trim(),

        email: emailValue,

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
              senderNumber || ""
            ).trim(),

        transactionId:
          cashOnDelivery
            ? ""
            : String(
              transactionId || ""
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

      title: "Order Placed",

      message: `Your order #${order._id} has been placed successfully.`,
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
      error
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
// ======================================================

export const getMyOrders = async (
  req,
  res
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
      error
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
// ======================================================

export const getOrderById =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }

      const order =
        await Order.findById(id).populate(
          "user",
          "name email"
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      const isAdmin =
        req.user?.role === "admin";

      if (!isAdmin) {
        if (!order.user) {
          return res.status(403).json({
            success: false,
            message:
              "You are not allowed to view this order",
          });
        }

        if (
          String(order.user._id) !==
          String(req.user._id)
        ) {
          return res.status(403).json({
            success: false,
            message:
              "You are not allowed to view this order",
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error(
        "Get order error:",
        error
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
      const { id } = req.params;

      const { status } = req.body;

      // ==================================================
      // STATUS VALIDATION
      // ==================================================

      if (
        !ALLOWED_ORDER_STATUSES.includes(
          status
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
          id
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
        await Order.findById(id).session(
          session
        );

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

      if (oldStatus === status) {
        await session.abortTransaction();

        return res.status(200).json({
          success: true,
          message: `Order is already ${status}`,
          data: order,
        });
      }

      // ==================================================
      // STATUS TRANSITION
      // ==================================================

      const allowedNextStatuses =
        ALLOWED_STATUS_TRANSITIONS[
        oldStatus
        ] || [];

      if (
        !allowedNextStatuses.includes(
          status
        )
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: `Cannot change order status from ${oldStatus} to ${status}`,
        });
      }

      // ==================================================
      // CONFIRM ORDER
      // ==================================================
      //
      // Pending → Confirmed
      //
      // stock -= quantity
      // soldQuantity += quantity
      //
      // ==================================================

      const confirmingOrder =
        oldStatus === "Pending" &&
        status === "Confirmed";

      if (confirmingOrder) {
        const quantityMap =
          new Map();

        // -----------------------------------------------
        // COMBINE DUPLICATE PRODUCTS
        // -----------------------------------------------

        for (const item of order.orderItems) {
          const productId =
            item.product?.toString();

          const quantity =
            Number(item.quantity);

          if (!productId) {
            throw new Error(
              "Product ID is missing from order item"
            );
          }

          if (
            !Number.isInteger(
              quantity
            ) ||
            quantity <= 0
          ) {
            throw new Error(
              "Invalid product quantity in order"
            );
          }

          const previous =
            quantityMap.get(
              productId
            ) || 0;

          quantityMap.set(
            productId,
            previous + quantity
          );
        }

        // -----------------------------------------------
        // ATOMIC STOCK + SOLD UPDATE
        // -----------------------------------------------

        for (const [
          productId,
          quantity,
        ] of quantityMap.entries()) {
          const updatedProduct =
            await Product.findOneAndUpdate(
              {
                _id: productId,

                stock: {
                  $gte: quantity,
                },
              },

              {
                $inc: {
                  stock: -quantity,

                  soldQuantity:
                    quantity,
                },
              },

              {
                new: true,

                session,
              }
            );

          // ---------------------------------------------
          // PRODUCT NOT FOUND / INSUFFICIENT STOCK
          // ---------------------------------------------

          if (!updatedProduct) {
            const product =
              await Product.findById(
                productId
              )
                .session(session)
                .lean();

            if (!product) {
              throw new Error(
                "Product not found while confirming order"
              );
            }

            throw new Error(
              `${getProductName(
                product
              )} has insufficient stock. Available: ${Number(
                product.stock || 0
              )}, Required: ${quantity}`
            );
          }

          // ---------------------------------------------
          // SAFETY CHECK
          // ---------------------------------------------

          if (
            Number(
              updatedProduct.soldQuantity
            ) < 0
          ) {
            throw new Error(
              `Invalid sold quantity for ${getProductName(
                updatedProduct
              )}`
            );
          }
        }
      }

      // ==================================================
      // CANCEL ORDER
      // ==================================================
      //
      // Confirmed → Cancelled
      // Processing → Cancelled
      // Shipped → Cancelled
      //
      // stock += quantity
      // soldQuantity -= quantity
      //
      // ==================================================

      const restoringStock =
        status === "Cancelled" &&
        [
          "Confirmed",
          "Processing",
          "Shipped",
        ].includes(oldStatus);

      if (restoringStock) {
        const quantityMap =
          new Map();

        // -----------------------------------------------
        // COMBINE DUPLICATE PRODUCTS
        // -----------------------------------------------

        for (const item of order.orderItems) {
          const productId =
            item.product?.toString();

          const quantity =
            Number(item.quantity);

          if (!productId) {
            throw new Error(
              "Product ID is missing from order item"
            );
          }

          if (
            !Number.isInteger(
              quantity
            ) ||
            quantity <= 0
          ) {
            throw new Error(
              "Invalid product quantity in order"
            );
          }

          const previous =
            quantityMap.get(
              productId
            ) || 0;

          quantityMap.set(
            productId,
            previous + quantity
          );
        }

        // -----------------------------------------------
        // ATOMIC STOCK RESTORATION
        // -----------------------------------------------

        for (const [
          productId,
          quantity,
        ] of quantityMap.entries()) {
          const updatedProduct =
            await Product.findOneAndUpdate(
              {
                _id: productId,

                soldQuantity: {
                  $gte: quantity,
                },
              },

              {
                $inc: {
                  stock: quantity,

                  soldQuantity:
                    -quantity,
                },
              },

              {
                new: true,

                session,
              }
            );

          if (!updatedProduct) {
            const product =
              await Product.findById(
                productId
              )
                .session(session)
                .lean();

            if (!product) {
              throw new Error(
                `Product ${productId} not found while restoring stock`
              );
            }

            throw new Error(
              `${getProductName(
                product
              )} cannot restore stock because sold quantity is insufficient`
            );
          }
        }
      }

      // ==================================================
      // UPDATE ORDER STATUS
      // ==================================================

      order.orderStatus = status;

      // ==================================================
      // COD PAYMENT
      // ==================================================

      if (
        status === "Delivered" &&
        isCOD(order.paymentMethod)
      ) {
        order.isPaid = true;

        order.paymentStatus =
          "Paid";

        order.paidAt =
          order.paidAt ||
          new Date();
      }

      // ==================================================
      // CANCELLED
      // ==================================================

      if (
        status === "Cancelled"
      ) {
        order.cancelledAt =
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

      const deliveredAndPaid =
        oldStatus !== "Delivered" &&
        status === "Delivered" &&
        updatedOrder.isPaid === true;

      if (deliveredAndPaid) {
        await createOrderIncome({
          order: updatedOrder,

          createdBy:
            req.user?._id ||
            null,

          session,
        });

        await createProductCost({
          order: updatedOrder,

          createdBy:
            req.user?._id ||
            null,

          session,
        });

        // ------------------------------------------------
        // SHIPPING COST
        // ------------------------------------------------
        //
        // Actual courier cost should be supplied separately.
        //

        // await createShippingCost({
        //   order: updatedOrder,
        //   amount: actualCourierCost,
        //   createdBy: req.user?._id || null,
        //   session,
        // });

        // ------------------------------------------------
        // PAYMENT FEE
        // ------------------------------------------------

        // await createPaymentFee({
        //   order: updatedOrder,
        //   amount: actualGatewayFee,
        //   createdBy: req.user?._id || null,
        //   session,
        // });
      }

      // ==================================================
      // COMMIT
      // ==================================================

      await session.commitTransaction();

      // ==================================================
      // SEND ORDER STATUS TO N8N
      // ==================================================

      await sendOrderStatusToN8N(
        updatedOrder
      );

      // ==================================================
      // NOTIFICATION
      // ==================================================

      await createOrderNotification({
        user: updatedOrder.user,

        title:
          "Order Status Updated",

        message: `Your order #${updatedOrder._id} has been ${status.toLowerCase()}.`,
      });

      // ==================================================
      // RESPONSE
      // ==================================================

      return res.status(200).json({
        success: true,

        message:
          `Order status updated to ${status}`,

        data: updatedOrder,
      });
    } catch (error) {
      // ==================================================
      // ABORT
      // ==================================================

      if (session.inTransaction()) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          console.error(
            "Transaction abort error:",
            abortError
          );
        }
      }

      // ==================================================
      // DUPLICATE FINANCIAL TRANSACTION
      // ==================================================

      if (
        error?.code === 11000
      ) {
        console.error(
          "Duplicate financial transaction:",
          error
        );

        return res.status(409).json({
          success: false,
          message:
            "Financial transaction already exists for this order",
        });
      }

      // ==================================================
      // ERROR
      // ==================================================

      console.error(
        "Update order status error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
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
// GET ALL ORDERS
// ======================================================

export const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({})
        .populate(
          "user",
          "name email"
        )
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
      "Get all orders error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to get all orders",
    });
  }
};

// ======================================================
// REFUND ORDER
// ======================================================

export const refundOrder = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const { id } = req.params;

    // ==================================================
    // ID VALIDATION
    // ==================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
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
      await Order.findById(id).session(
        session
      );

    if (!order) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    // ==================================================
    // ALREADY REFUNDED
    // ==================================================

    if (
      order.paymentStatus ===
      "Refunded"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Order is already refunded",
      });
    }

    // ==================================================
    // PAID VALIDATION
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
    // DELIVERED VALIDATION
    // ==================================================

    if (
      order.orderStatus !==
      "Delivered"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Only delivered orders can be refunded",
      });
    }

    // ==================================================
    // PAYMENT STATUS
    // ==================================================

    order.paymentStatus =
      "Refunded";

    order.isPaid = false;

    order.refundedAt =
      new Date();

    // ==================================================
    // SAVE ORDER
    // ==================================================

    const updatedOrder =
      await order.save({
        session,
      });

    // ==================================================
    // FINANCIAL REFUND
    // ==================================================

    await createOrderRefund({
      order: updatedOrder,

      createdBy:
        req.user?._id ||
        null,

      session,
    });

    // ==================================================
    // COMMIT
    // ==================================================

    await session.commitTransaction();

    // ==================================================
    // NOTIFICATION
    // ==================================================

    await createOrderNotification({
      user: updatedOrder.user,

      title:
        "Order Refunded",

      message: `Your order #${updatedOrder._id} has been refunded successfully.`,
    });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        "Order refunded successfully",

      data: updatedOrder,
    });
  } catch (error) {
    // ==================================================
    // ABORT
    // ==================================================

    if (session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error(
          "Refund transaction abort error:",
          abortError
        );
      }
    }

    // ==================================================
    // DUPLICATE REFUND
    // ==================================================

    if (
      error?.code === 11000
    ) {
      console.error(
        "Duplicate refund transaction:",
        error
      );

      return res.status(409).json({
        success: false,

        message:
          "Refund transaction already exists for this order",
      });
    }

    // ==================================================
    // ERROR
    // ==================================================

    console.error(
      "Refund order error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to refund order",

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


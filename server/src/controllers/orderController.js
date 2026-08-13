// File Path: backend/controllers/orderController.js

import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Notification } from "../models/Notification.js";

// ==========================================
// CREATE ORDER
// POST /api/v1/orders
// ==========================================

export const createOrder = async (req, res) => {
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

    // ==========================================
    // CHECK ORDER ITEMS
    // ==========================================

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items",
      });
    }

    // ==========================================
    // CHECK SHIPPING INFORMATION
    // ==========================================

    if (!customerName || !email || !phone || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and shipping address are required",
      });
    }

    if (!deliveryArea) {
      return res.status(400).json({
        success: false,
        message: "Delivery area is required",
      });
    }

    // ==========================================
    // BANGLADESH PHONE VALIDATION
    // Must start with 01 and contain exactly 11 digits
    // Example: 01712345678
    // ==========================================

    const phoneRegex = /^01[0-9]{9}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 11-digit Bangladesh mobile number starting with 01",
      });
    }

    // ==========================================
    // CALCULATE SUBTOTAL
    // ==========================================

    let subtotal = 0;

    const processedOrderItems = [];

    for (const item of orderItems) {
      const productId = item.product || item.productId;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is missing",
        });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const quantity = Number(item.quantity) || 1;

      /*
       * IMPORTANT:
       * এখানে stock কমানো হচ্ছে না।
       * শুধু order-এর জন্য product পাওয়া যাচ্ছে কিনা
       * সেটা check করা হচ্ছে।
       */

      const price =
        Number(item.price) ||
        Number(product.price) ||
        Number(product.retailPrice) ||
        0;

      subtotal += price * quantity;

      processedOrderItems.push({
        product: product._id,

        name: item.name || product.name || product.title || "Product",

        image: item.image || product.image || "",

        price,

        quantity,

        size: item.size || item.selectedSize || "N/A",

        color: item.color || item.selectedColor || "N/A",
      });
    }

    // ==========================================
    // DELIVERY CHARGE
    // ==========================================

    const deliveryFee =
      shippingFee !== undefined ? Number(shippingFee) : 100;

    // ==========================================
    // FINAL TOTAL
    // ==========================================

    const totalAmount = subtotal + deliveryFee;

    // ==========================================
    // PAYMENT INFORMATION
    // ==========================================

    const isCashOnDelivery = paymentMethod === "Cash on Delivery";

    /*
     * Online payment automatically Paid করা হচ্ছে না।
     * আপাতত সব নতুন order Pending থাকবে।
     */

    // ==========================================
    // CREATE ORDER
    // ==========================================

    const order = await Order.create({
      user: req.user?._id || null,

      customerName,
      email,
      phone,
      deliveryArea,

      shippingAddress:
        typeof shippingAddress === "object"
          ? `${shippingAddress.street || ""}, ${shippingAddress.city || ""}`
          : shippingAddress,

      orderItems: processedOrderItems,

      paymentMethod: paymentMethod || "Cash on Delivery",

      senderNumber: isCashOnDelivery ? "" : senderNumber || "",

      transactionId: isCashOnDelivery ? "" : transactionId || "",

      paymentStatus: "Pending",

      isPaid: false,

      paidAt: null,

      subtotal,

      shippingFee: deliveryFee,

      totalAmount,

      orderStatus: "Pending",
    });

    // ==========================================
// CREATE ORDER PLACED NOTIFICATION
// ==========================================

if (order.user) {
  try {
    await Notification.create({
      user: order.user,

      title: "Order Placed",

      message: `Your order #${order._id} has been placed successfully.`,

      type: "order",

      isRead: false,
    });

    console.log(
      `Order notification created for user ${order.user} - Order ${order._id}`,
    );
  } catch (notificationError) {
    // Notification fail করলেও order fail করবে না
    console.error(
      "Order notification creation error:",
      notificationError,
    );
  }
}

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Order creation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET MY ORDERS
// GET /api/v1/orders/myorders
// ==========================================

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET SINGLE ORDER
// GET /api/v1/orders/:id
// ==========================================

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE ORDER STATUS
// PUT /api/v1/orders/:id/status
// ==========================================

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // ==========================================
    // ALLOWED STATUSES
    // ==========================================

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // SAVE OLD STATUS
    // ==========================================

    const oldStatus = order.orderStatus;

    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================

    order.orderStatus = status;

    // ==========================================
    // COD ORDER BECOMES PAID WHEN DELIVERED
    // ==========================================

    if (
      status === "Delivered" &&
      order.paymentMethod === "Cash on Delivery"
    ) {
      order.isPaid = true;

      order.paymentStatus = "Paid";

      order.paidAt = new Date();
    }

    // ==========================================
    // SAVE UPDATED ORDER
    // ==========================================

    const updatedOrder = await order.save();

    // ==========================================
    // CREATE USER NOTIFICATION
    // ==========================================

    /*
     * Only create notification when:
     *
     * 1. Status actually changed
     * 2. Order belongs to a logged-in user
     */

    if (oldStatus !== status && order.user) {
      try {
        await Notification.create({
          user: order.user,

          title: "Order Status Updated",

          message: `Your order #${order._id} has been ${status.toLowerCase()}.`,

          type: "order",

          isRead: false,
        });

        console.log(
          `Notification created for user ${order.user} - Order ${order._id}`,
        );
      } catch (notificationError) {
        /*
         * Notification fail করলেও
         * order status update fail করবে না।
         */

        console.error(
          "Notification creation error:",
          notificationError,
        );
      }
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      message: `Order status updated to ${status}`,

      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL ORDERS
// GET /api/v1/orders
// ==========================================

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
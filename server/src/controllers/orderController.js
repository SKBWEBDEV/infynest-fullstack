import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Notification } from '../models/Notification.js';

// @desc    Create new order (with stock check, reduction & dynamic pricing B2B/B2C)
// @route   POST /api/v1/orders
export const createOrder = async (req, res) => {
  try {
    const { 
      orderItems, 
      shippingAddress, 
      phone, 
      customerName, 
      paymentMethod, 
      senderNumber, 
      transactionId,
      shippingFee
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    let itemsPrice = 0;
    let isB2BOrder = false;
    const processedOrderItems = [];

    for (const item of orderItems) {
      const productId = item.product || item.productId;
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found` });
      }

      const orderQty = Number(item.quantity || item.qty) || 1;

      // ১. স্টক পর্যাপ্ত আছে কিনা চেক করা
      if (product.stock < orderQty) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock} items` 
        });
      }

      // ২. B2B বা B2C দাম নির্ধারণ
      let itemPrice = product.retailPrice || item.price;
      if (req.user && req.user.role === 'wholesaler' && orderQty >= product.minWholesaleQty) {
        itemPrice = product.wholesalePrice || product.retailPrice;
        isB2BOrder = true;
      }

      itemsPrice += itemPrice * orderQty;

      // ৩. স্কিমা অনুযায়ী quantity নাম ব্যবহার করা হলো
      processedOrderItems.push({
        product: product._id,
        name: product.name,
        image: item.image || product.image || '',
        price: itemPrice,
        quantity: orderQty,
        size: item.size || item.selectedSize || 'N/A',
        color: item.color || item.selectedColor || 'N/A',
      });
    }

    // ৪. স্টক নিরাপদে কমানো এবং ডাটাবেজে আপডেট করা
    for (const item of processedOrderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const currentStock = Number(product.stock) || 0;
        product.stock = Math.max(0, currentStock - item.quantity);
        await product.save();
      }
    }

    const taxPrice = itemsPrice * 0.05; // ৫% ভ্যাট
    const deliveryFee = shippingFee !== undefined ? Number(shippingFee) : (itemsPrice > 5000 ? 0 : 100);
    const calculatedTotalAmount = itemsPrice + taxPrice + deliveryFee;

    // 💳 পেমেন্ট মেথড চেক: ক্যাশ অন ডেলিভারি না হলে অটো Paid হবে
    const isOnlinePayment = paymentMethod && paymentMethod !== 'Cash on Delivery';

    // ৫. স্কিমা অনুযায়ী totalAmount এবং সঠিক ফিল্ড দিয়ে অর্ডার ক্রিয়েট করা
    const order = await Order.create({
      user: req.user._id,
      customerName: customerName || req.user.name,
      phone: phone || '',
      shippingAddress: typeof shippingAddress === 'object' 
        ? `${shippingAddress.street || ''}, ${shippingAddress.city || ''}` 
        : shippingAddress,
      orderItems: processedOrderItems,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      senderNumber: senderNumber || '',
      transactionId: transactionId || '',
      
      // পেমেন্ট স্ট্যাটাস ফিল্ডসমূহ
      paymentStatus: isOnlinePayment ? 'Paid' : 'Pending',
      isPaid: isOnlinePayment,
      paidAt: isOnlinePayment ? Date.now() : null,

      itemsPrice,
      taxPrice,
      shippingPrice: deliveryFee,
      totalAmount: calculatedTotalAmount, 
      totalPrice: calculatedTotalAmount,  
      orderType: isB2BOrder ? 'B2B' : 'B2C',
    });

    res.status(201).json({ 
      success: true, 
      message: 'Order created and stock updated successfully', 
      data: order 
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/v1/orders/myorders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order to delivered (Admin only)
// @route   PUT /api/v1/orders/:id/deliver
export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();

    res.status(200).json({ success: true, message: 'Order marked as delivered', data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/v1/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; 
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;

    // যদি স্ট্যাটাস Delivered হয়
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      
      // ক্যাশ অন ডেলিভারি হলেও পণ্য হাতে পেয়ে টাকা পরিশোধ করায় এখন Paid হয়ে যাবে
      order.isPaid = true;
      order.paymentStatus = 'Paid';
      order.paidAt = Date.now();
    } else {
      order.isDelivered = false;
    }

    const updatedOrder = await order.save();

    // নোটিফিকেশন তৈরি
    if (order.user) {
      try {
        await Notification.create({
          user: order.user,
          message: `আপনার অর্ডার #${order._id.toString().slice(-8)} এর স্ট্যাটাস আপডেট হয়ে হয়েছে: ${status}`,
          orderId: order._id
        });
      } catch (notifError) {
        console.error('Notification error:', notifError);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Order status updated to ${status}`, 
      data: updatedOrder 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/v1/orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
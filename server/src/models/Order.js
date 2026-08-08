// File Path: models/orderModel.js

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, default: 'N/A' },
  color: { type: String, default: 'N/A' },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    
    orderItems: [orderItemSchema],
    
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash on Delivery', 'bKash', 'Nagad'],
      default: 'Cash on Delivery',
    },

    // বিকাশ বা নগদের জন্য সেন্ডার ও ট্রানজ্যাকশন আইডি
    senderNumber: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    
    // 💳 পেমেন্ট স্ট্যাটাস ট্র্যাকিং ফিল্ডস
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },

    totalAmount: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 100 },
    
    orderStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], 
      default: 'Pending',
    },
    stockReduced: {
  type: Boolean,
  default: false,
},
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
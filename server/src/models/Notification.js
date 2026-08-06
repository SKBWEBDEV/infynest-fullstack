import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  isRead: { type: Boolean, default: false }, // আনরিড হলে false, পড়া হলে true
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
import { Notification } from '../models/Notification.js';

// গেট অল নোটিফিকেশন ফর লগইন ইউজার
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// একটি নোটিফিকেশন রিড করা (New হটিয়ে দেওয়া)
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      notification.isRead = true;
      await notification.save();
      res.status(200).json({ success: true, message: 'Marked as read' });
    } else {
      res.status(404).json({ success: false, message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// সিঙ্গেল নোটিফিকেশন ডিলিট
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// সব নোটিফিকেশন ক্লিয়ার করা (Clear All)
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.status(200).json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
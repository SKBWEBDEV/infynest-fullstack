import { User } from '../models/User.js';

// ১. সকল ইউজারের লিস্ট দেখা (শুধু এডমিনের জন্য)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ২. ইউজারের রোল আপডেট করা (যেমন: customer থেকে admin করা)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['customer', 'wholesaler', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: `User role updated to ${role} successfully`, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ৩. ইউজার ডিলিট করা
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
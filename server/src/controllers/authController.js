import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ইমেল পাঠানোর হেলপার ফাংশন (ভেরিফিকেশনের জন্য)
const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const verificationUrl =
  `${process.env.BACKEND_URL}/api/v1/auth/verify-email/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification - INFYNEST',
    html: `<h3>Welcome to INFYNEST!</h3>
           <p>Please click the link below to verify your email address:</p>
           <a href="${verificationUrl}" target="_blank">Verify Email</a>
           <p>If you did not request this, please ignore this email.</p>`,
  });
};

// পাসওয়ার্ড রিসেট ইমেল পাঠানোর হেলপার ফাংশন
const sendResetPasswordEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - INFYNEST',

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Password Reset</h2>

        <p>
          You requested to reset your INFYNEST account password.
        </p>

        <p>
          Click the button below to create a new password.
        </p>

        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 6px;
          "
        >
          Reset Password
        </a>

        <p style="margin-top: 20px;">
          This link will expire in 10 minutes.
        </p>

        <p>
          If you did not request this password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};

// ১. রেজিস্টার কন্ট্রোলার (সিক্রেট কোড লজিক সহ আপডেটেড)
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, secretCode } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ডিফল্ট রোল কাস্টমার থাকবে
    let role = 'customer';

    // .env ফাইল থেকে সিক্রেট কোড চেক করা
    const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'shopbd_admin_secret_2026';

    // ইউজার যদি সঠিক সিক্রেট কোড দিয়ে থাকে, তবে রোল admin হয়ে যাবে
    if (secretCode && secretCode === ADMIN_SECRET_KEY) {
      role = 'admin';
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role, // এখানে রোল সেট হবে
      verificationToken,
      isVerified: false,
    });

    if (user) {
      await sendVerificationEmail(email, verificationToken);

      res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ২. ইমেল ভেরিফিকেশন কন্ট্রোলার
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).send(`
      <html>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
          <h2 style="color: green;">Email Verified Successfully!</h2>
          <p>You can now close this window and log in to your account.</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ৩. লগইন কন্ট্রোলার
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    if (await user.comparePassword(password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ৪. গুগল লগইন কন্ট্রোলার
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
        avatar: picture,
        isVerified: true,
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ message: 'Google authentication failed', error: error.message });
  }
};

// ৫. ফোরগট পাসওয়ার্ড কন্ট্রোলার
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    try {
      await sendResetPasswordEmail(email, resetToken);
      res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent', error: emailError.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ৬. পাসওয়ার্ড রিসেট কন্ট্রোলার
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });  
  }
};
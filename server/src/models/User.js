import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,   // নতুন যোগ করা হলো
    resetPasswordExpire: Date,    // নতুন যোগ করা হলো
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ["customer", "wholesaler", "admin"],
      default: "customer",
    },
  },
  { timestamps: true },
);

// সেভ করার আগে পাসওয়ার্ড হ্যাশ করার প্রসেস
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// লগইনের সময় পাসওয়ার্ড ম্যাচ করার হেলপার ফাংশন
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
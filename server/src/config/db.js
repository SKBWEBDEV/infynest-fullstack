import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1); // সার্ভার প্রসেস বন্ধ করবে যদি ডাটাবেজ কানেক্ট না হয়
  }
};

export default connectDB;
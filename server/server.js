import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import { adminRoutes } from './src/routes/adminRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://infynest-fullstack.vercel.app', // তোমার প্রধান ক্লিন ডোমেইন
    'https://infynest-fullstack-git-main-naj-muj-shakibs-projects.vercel.app' // তোমার গিট ব্রাঞ্চ লিংক
  ],
  credentials: true
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

import path from 'path';

// __dirname সেটআপ করার জন্য (যদি ES Module ব্যবহার করেন)
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'INFYNEST API is running smoothly' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);

// ==============ADMIN=======================
app.use('/api/v1/admin', adminRoutes);


// ==============NOTIFICATION================
app.use('/api/v1/notifications', notificationRoutes);

// Connect DB and Start Server
const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] INFYNEST Server running on port: ${PORT}`);
  });
});
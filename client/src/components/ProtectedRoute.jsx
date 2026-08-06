import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // লোকাল স্টোরেজ থেকে ইউজারের তথ্য চেক করা
  const userInfo = localStorage.getItem('userInfo');

  // যদি লগইন করা থাকে তবে নির্দিষ্ট পেজে যেতে দেবে, না হলে লগইন পেজে পাঠিয়ে দেবে
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
}
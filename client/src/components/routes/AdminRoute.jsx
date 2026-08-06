// File Path: src/components/routes/AdminRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (userInfo && userInfo.token && userInfo.role === 'admin') {
    return children;
  }

  return <Navigate to="/login" replace />;
}
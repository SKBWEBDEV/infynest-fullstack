import API from './api';

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await API.post('/auth/login', userData);
  // রেসপন্সে ডেটা থাকলে সেটি লোকালস্টোরেজে সেভ হবে
  if (response.data) {
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('userInfo');
};

export const forgotPassword = async (emailData) => {
  const response = await API.post('/auth/forgot-password', emailData);
  return response.data;
};

export const resetPassword = async (token, passwordData) => {
  const response = await API.put(`/auth/reset-password/${token}`, passwordData);
  return response.data;
};
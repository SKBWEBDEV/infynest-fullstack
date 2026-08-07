// File Path: src/api/api.js

import axios from 'axios';

// ডাইনামিকালি বেস ইউআরএল নির্ধারণ করার ফাংশন
const getBaseURL = () => {
  // যদি .env ফাইলে প্রোডাকশন বা নির্দিষ্ট কোনো লিংক দেওয়া থাকে (যেমন ভেরসেলের এনভায়রনমেন্ট ভ্যারিয়েবল)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // ব্রাউজারের বর্তমান হোস্ট বা আইপি ধরে নেওয়া (যেমন: localhost অথবা 192.168.x.x)
  const hostname = window.location.hostname;

  // ব্যাকএন্ডের পোর্ট (আপনার ব্যাকএন্ড যদি 5000 পোর্টে চলে)
  const backendPort = '5000';

  // লোকাল ডেভেলপমেন্টের জন্য
  return `http://${hostname}:${backendPort}/api/v1`;
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// রিকোয়েস্ট পাঠানোর সময় স্বয়ংক্রিয়ভাবে লোকালস্টোরেজ থেকে টোকেন যুক্ত করা
API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
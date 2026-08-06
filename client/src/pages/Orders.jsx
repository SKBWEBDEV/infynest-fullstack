// File Path: src/pages/MyOrders.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { HiOutlineShoppingBag, HiClock, HiCheckCircle, HiTruck, HiXCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('userInfo'))?.token;

      if (!token) {
        toast.error('Please login to view your orders');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/v1/orders/myorders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // 👈 ব্যাকএন্ড রেসপন্স থেকে data অ্যাররে রিসিভ করা
      if (response.data && response.data.data) {
        setOrders(response.data.data);
      } else if (Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px] font-bold"><HiCheckCircle /> Delivered</span>;
      case 'shipped':
        return <span className="inline-flex items-center gap-1 text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full text-[11px] font-bold"><HiTruck /> Shipped</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full text-[11px] font-bold"><HiXCircle /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-[11px] font-bold"><HiClock /> Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <HiOutlineShoppingBag className="text-purple-400" /> My Orders ({orders.length})
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#161920] border border-gray-800 rounded-3xl p-12 text-center space-y-4">
            <p className="text-sm text-gray-400">You haven't placed any orders yet.</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-[#161920] border border-gray-800/80 rounded-2xl p-5 space-y-4 shadow-xl"
              >
                {/* 🏷️ অর্ডারের হেডার অংশ */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3 text-xs">
                  <div>
                    <span className="text-gray-400">Order ID: </span>
                    <span className="font-mono font-bold text-white">#{order._id.slice(-8)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Date: </span>
                    <span className="text-gray-300 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(order.orderStatus || 'Pending')}
                  </div>
                </div>

                {/* 📦 প্রোডাক্ট এর তালিকা */}
                <div className="space-y-3">
                  {order.orderItems && order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 bg-[#0f1115] p-3 rounded-xl border border-gray-800/50">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image.startsWith('http') ? item.image : `http://localhost:5000/${item.image}`} 
                          alt={item.name} 
                          className="w-14 h-14 object-cover rounded-lg bg-gray-900 border border-gray-800 shrink-0"
                        />
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-white text-xs md:text-sm line-clamp-1">{item.name}</h4>
                          <div className="flex items-center gap-3 text-[11px] text-gray-400">
                            <span>Qty: <strong className="text-white">{item.quantity || item.qty}</strong></span>
                            {item.size && item.size !== 'N/A' && <span>Size: <strong className="text-white">{item.size}</strong></span>}
                            {item.color && item.color !== 'N/A' && <span>Color: <strong className="text-white">{item.color}</strong></span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-purple-400">৳{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 💳 পেমেন্ট এবং সামারি অংশ */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs border-t border-gray-800/80">
  <div className="space-y-1">
    
    {/* পেমেন্ট মেথড এবং পেমেন্ট স্ট্যাটাস ব্যাজ এক লাইনে */}
    <div className="flex items-center gap-2 flex-wrap">
      <p className="text-gray-400">
        Payment Method: <span className="font-bold text-white">{order.paymentMethod}</span>
      </p>
      
      {/* 💳 পেমেন্ট স্ট্যাটাস ব্যাজ */}
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
        order.paymentStatus === 'Paid' 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      }`}>
        {order.paymentStatus || 'Pending'}
      </span>
    </div>

    <p className="text-gray-400">
      Address: <span className="text-gray-300">{order.shippingAddress}</span>
    </p>
  </div>

  <div className="text-right">
    <p className="text-xs text-gray-400">Total Amount</p>
    <p className="text-base font-black text-purple-400">৳{order.totalAmount || order.totalPrice}</p>
  </div>
</div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
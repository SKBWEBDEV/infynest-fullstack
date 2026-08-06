// File Path: src/pages/admin/AdminOrders.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  HiClipboardList, 
  HiCheckCircle, 
  HiTruck, 
  HiClock, 
  HiPhone, 
  HiUser, 
  HiLocationMarker, 
  HiArrowLeft, 
  HiSearch, 
  HiFilter,
  HiRefresh
} from 'react-icons/hi';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ফিল্টার এবং সার্চ স্টেট
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('userInfo'))?.token;

      if (!token) {
        toast.error('Admin token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/v1/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.data) {
        setOrders(response.data.data);
      } else if (Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch all orders');
    } finally {
      setLoading(false);
    }
  };

  // অর্ডার স্ট্যাটাস আপডেট করার ফাংশন
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('userInfo'))?.token;

      const response = await axios.put(`http://localhost:5000/api/v1/orders/${orderId}/status`, 
        { status: newStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Order status changed to ${newStatus}!`);
        fetchAllOrders(); // রিফ্রেশ লিস্ট
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  // সার্চ এবং ফিল্টার লজিক
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.phone && order.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'All' || (order.orderStatus || 'Pending') === statusFilter;
    const matchesPayment = paymentFilter === 'All' || order.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[11px] font-bold">Delivered</span>;
      case 'shipped':
        return <span className="text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-[11px] font-bold">Shipped</span>;
      case 'processing':
        return <span className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[11px] font-bold">Processing</span>;
      case 'confirmed':
        return <span className="text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-[11px] font-bold">Confirmed</span>;
      case 'cancelled':
        return <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-[11px] font-bold">Cancelled</span>;
      default:
        return <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[11px] font-bold">Pending</span>;
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
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* হেডার ও ব্যাক বাটন */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 bg-[#161920] border border-gray-800 hover:bg-gray-800 text-white rounded-xl transition cursor-pointer"
              title="Go Back"
            >
              <HiArrowLeft className="text-lg" />
            </button>
            <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <HiClipboardList className="text-purple-400" /> Admin Dashboard - All Orders ({filteredOrders.length})
            </h1>
          </div>
          <button 
            onClick={fetchAllOrders}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <HiRefresh /> Refresh
          </button>
        </div>

        {/* 🔍 সার্চ এবং ফিল্টার বার */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#161920] p-4 rounded-2xl border border-gray-800">
          {/* সার্চ ইনপুট */}
          <div className="relative">
            <HiSearch className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
            <input 
              type="text"
              placeholder="Search by Order ID, Name, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1115] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* স্ট্যাটাস ফিল্টার */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#0f1115] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* পেমেন্ট মেথড ফিল্টার */}
          <div className="relative">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full bg-[#0f1115] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="All">All Payment Methods</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
            </select>
          </div>
        </div>

        {/* অর্ডারের তালিকা */}
        {filteredOrders.length === 0 ? (
          <div className="bg-[#161920] border border-gray-800 rounded-3xl p-12 text-center space-y-4">
            <p className="text-sm text-gray-400">No matching orders found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div 
                key={order._id} 
                className="bg-[#161920] border border-gray-800/80 rounded-3xl p-6 space-y-5 shadow-xl"
              >
                {/* 🏷️ অর্ডার আইডি, ডেট ও স্ট্যাটাস ব্যাজ */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4 text-xs">
                  <div>
                    <span className="text-gray-400">Order ID: </span>
                    <span className="font-mono font-bold text-white">#{order._id}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Date: </span>
                    <span className="text-gray-300 font-medium">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(order.orderStatus || 'Pending')}
                  </div>
                </div>

                {/* 👤 কাস্টমার ইনফো */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-[#0f1115] p-4 rounded-2xl border border-gray-800/60">
                  <div className="space-y-1">
                    <p className="text-gray-400 flex items-center gap-1.5"><HiUser className="text-purple-400" /> Customer Name</p>
                    <p className="font-bold text-white text-sm">{order.customerName || order.user?.name || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 flex items-center gap-1.5"><HiPhone className="text-purple-400" /> Phone Number</p>
                    <p className="font-bold text-white text-sm">{order.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 flex items-center gap-1.5"><HiLocationMarker className="text-purple-400" /> Shipping Address</p>
                    <p className="font-bold text-white text-sm line-clamp-1">{order.shippingAddress || 'N/A'}</p>
                  </div>
                </div>

                {/* 🖼️ প্রোডাক্ট লিস্ট */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Items:</h4>
                  {order.orderItems && order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 bg-[#0f1115] p-3 rounded-2xl border border-gray-800">
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.image && item.image.startsWith('http') ? item.image : `http://localhost:5000/${item.image}`} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-xl bg-gray-900 border border-gray-800 shrink-0"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                        <div className="space-y-1">
                          <h5 className="font-bold text-white text-xs md:text-sm">{item.name}</h5>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                            <span>Price: <strong className="text-purple-400">৳{item.price}</strong></span>
                            <span>Qty: <strong className="text-white">{item.quantity}</strong></span>
                            {item.size && item.size !== 'N/A' && <span>Size: <strong className="text-white">{item.size}</strong></span>}
                            {item.color && item.color !== 'N/A' && <span>Color: <strong className="text-white">{item.color}</strong></span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">Subtotal</p>
                        <p className="text-xs md:text-sm font-bold text-white">৳{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 💳 পেমেন্ট ইনফো এবং স্ট্যাটাস চেঞ্জার ড্রপডাউন */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-800 text-xs">
                  <div className="space-y-1">
                    <p className="text-gray-400">
                      Payment Method: <span className="font-bold text-white">{order.paymentMethod}</span>
                    </p>
                    {order.paymentMethod !== 'Cash on Delivery' && (
                      <div className="text-gray-400 space-x-3">
                        <span>Sender: <strong className="text-white">{order.senderNumber || 'N/A'}</strong></span>
                        <span>TrxID: <strong className="text-purple-400 font-mono">{order.transactionId || 'N/A'}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-right">
                      <p className="text-gray-400">Total Amount</p>
                      <p className="text-lg font-black text-purple-400">৳{order.totalAmount || order.totalPrice}</p>
                    </div>

                    {/* ডাইনামিক স্ট্যাটাস চেঞ্জ ড্রপডাউন */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">Change Status:</span>
                      <select
                        value={order.orderStatus || 'Pending'}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-[#0f1115] border border-purple-500/50 text-purple-300 font-bold px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-400 transition cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiBell, HiTrash, HiCheck } from 'react-icons/hi';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // প্রতি ৩০ সেকেন্ড পর পর অটো নোটিফিকেশন চেক করবে
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('userInfo'))?.token;
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/v1/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.data) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // ক্লিক করলে 'New' চলে যাবে (isRead = true হবে)
  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('userInfo'))?.token;
      await axios.put(`http://localhost:5000/api/v1/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // সিঙ্গেল রিমুভ
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('userInfo'))?.token;
      await axios.delete(`http://localhost:5000/api/v1/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // অল ক্লিয়ার
  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('userInfo'))?.token;
      await axios.delete('http://localhost:5000/api/v1/notifications/clear/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* 🔔 নোটিফিকেশন বেল আইকন ও কাউন্ট ব্যাজ */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-[#161920] border border-gray-800 hover:bg-gray-800 text-white rounded-xl transition cursor-pointer"
      >
        <HiBell className="text-xl text-purple-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0f1115]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📋 নোটিফিকেশন ড্রপডাউন বক্স */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-[#161920] border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          
          {/* হেডার */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 text-xs">
            <span className="font-bold text-white">Notifications ({notifications.length})</span>
            {notifications.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-rose-400 hover:text-rose-300 font-bold transition cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {/* লিস্ট আইটেম */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id}
                  onClick={() => handleMarkAsRead(notif._id, notif.isRead)}
                  className={`p-3.5 text-xs transition flex items-start justify-between gap-3 cursor-pointer ${
                    notif.isRead ? 'bg-[#161920] text-gray-400' : 'bg-purple-600/10 text-white font-medium'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!notif.isRead && (
                        <span className="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          New
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{notif.message}</p>
                  </div>

                  {/* সিঙ্গেল রিমুভ বাটন */}
                  <button 
                    onClick={(e) => handleDelete(e, notif._id)}
                    className="text-gray-500 hover:text-rose-400 p-1 transition shrink-0"
                    title="Remove"
                  >
                    <HiTrash className="text-sm" />
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}
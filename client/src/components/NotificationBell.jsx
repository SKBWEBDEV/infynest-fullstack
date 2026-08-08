
import React, { useState, useEffect } from "react";
import API from "../services/api";
import { HiBell, HiTrash } from "react-icons/hi";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // প্রতি ৩০ সেকেন্ড পর পর notification check করবে
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications");

      if (response.data && response.data.data) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;

    try {
      await API.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Delete single notification
  const handleDelete = async (e, id) => {
    e.stopPropagation();

    try {
      await API.delete(`/notifications/${id}`);

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== id)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    try {
      await API.delete("/notifications/clear/all");

      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div className="relative">
      {/* 🔔 Notification Bell */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2.5 bg-[#161920] border border-gray-800 hover:bg-gray-800 text-white rounded-xl transition cursor-pointer"
      >
        <HiBell className="text-lg" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* 📋 Responsive Notification Dropdown */}
      {isOpen && (
        <div
          className="
            absolute
            top-full
            right-0
            mt-3
            z-50
            w-[calc(100vw-2rem)]
            max-w-[380px]
            sm:w-[360px]
            md:w-96
            bg-[#161920]
            border
            border-gray-800
            rounded-2xl
            shadow-2xl
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-800">
            <span className="font-bold text-white text-xs sm:text-sm">
              Notifications ({notifications.length})
            </span>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-rose-400 hover:text-rose-300 text-[11px] sm:text-xs font-bold transition cursor-pointer whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[65vh] sm:max-h-80 overflow-y-auto divide-y divide-gray-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() =>
                    handleMarkAsRead(notif._id, notif.isRead)
                  }
                  className={`
                    p-3 sm:p-3.5
                    text-xs
                    transition
                    flex
                    items-start
                    justify-between
                    gap-3
                    cursor-pointer
                    ${
                      notif.isRead
                        ? "bg-[#161920] text-gray-400"
                        : "bg-purple-600/10 text-white font-medium"
                    }
                  `}
                >
                  {/* Notification Content */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!notif.isRead && (
                        <span className="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          New
                        </span>
                      )}

                      <span className="text-[10px] text-gray-500">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="leading-relaxed break-words pr-1">
                      {notif.message}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, notif._id)}
                    className="text-gray-500 hover:text-rose-400 p-1.5 transition shrink-0"
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


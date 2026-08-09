import React, { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { HiBell, HiTrash } from "react-icons/hi";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const notificationRef = useRef(null);

  // --------------------------------------------------
  // FETCH NOTIFICATIONS
  // --------------------------------------------------

  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications");

      if (response.data?.data) {
        setNotifications(response.data.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // --------------------------------------------------
  // INITIAL FETCH + AUTO REFRESH
  // --------------------------------------------------

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // --------------------------------------------------
  // CLOSE WHEN CLICK OUTSIDE
  // --------------------------------------------------

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // --------------------------------------------------
  // MARK AS READ
  // --------------------------------------------------

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;

    try {
      await API.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // --------------------------------------------------
  // DELETE SINGLE NOTIFICATION
  // --------------------------------------------------

  const handleDelete = async (event, id) => {
    event.stopPropagation();

    try {
      await API.delete(`/notifications/${id}`);

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== id),
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // --------------------------------------------------
  // CLEAR ALL
  // --------------------------------------------------

  const handleClearAll = async () => {
    try {
      await API.delete("/notifications/clear/all");

      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // --------------------------------------------------
  // UNREAD COUNT
  // --------------------------------------------------

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <div ref={notificationRef} className="relative">
      {/* ==================================================
          NOTIFICATION BUTTON
      ================================================== */}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="
          relative
          flex
          items-center
          justify-center
          w-10
          h-10
          sm:w-11
          sm:h-11
          p-2
          bg-[#161920]
          border
          border-gray-800
          hover:bg-gray-800
          active:bg-gray-700
          text-white
          rounded-xl
          transition
          cursor-pointer
          focus:outline-none
          focus:ring-2
          focus:ring-purple-500/40
        "
      >
        <HiBell className="text-lg sm:text-xl" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            className="
              absolute
              -top-1
              -right-1
              min-w-[18px]
              h-[18px]
              sm:min-w-[20px]
              sm:h-5
              px-1
              bg-red-600
              text-white
              text-[9px]
              sm:text-[10px]
              font-bold
              rounded-full
              flex
              items-center
              justify-center
              border-2
              border-[#0f1115]
              shadow-lg
            "
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ==================================================
          NOTIFICATION DROPDOWN
      ================================================== */}

      {isOpen && (
        <div
          className="
            fixed
            sm:absolute
            top-[70px]
            sm:top-full
            right-2
            sm:right-0
            sm:mt-3
            z-[9999]

            w-[calc(100vw-1rem)]
            max-w-[390px]

            sm:w-[360px]
            md:w-[390px]

            bg-[#161920]
            border
            border-gray-800
            rounded-2xl

            shadow-[0_20px_60px_rgba(0,0,0,0.45)]

            overflow-hidden
          "
        >
          {/* --------------------------------------------------
              HEADER
          -------------------------------------------------- */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              px-4
              py-3
              sm:px-5
              sm:py-3.5
              border-b
              border-gray-800
              bg-[#161920]
            "
          >
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-white">
                Notifications
              </h3>

              <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount !== 1 ? "s" : ""
                    }`
                  : "You're all caught up"}
              </p>
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="
                  shrink-0
                  px-2.5
                  py-1.5
                  rounded-lg
                  text-[10px]
                  sm:text-[11px]
                  font-bold
                  text-rose-400
                  hover:text-white
                  hover:bg-rose-500/10
                  transition
                  cursor-pointer
                "
              >
                Clear All
              </button>
            )}
          </div>

          {/* --------------------------------------------------
              NOTIFICATION LIST
          -------------------------------------------------- */}

          <div
            className="
              max-h-[calc(100vh-150px)]
              sm:max-h-[420px]
              overflow-y-auto
              overscroll-contain
            "
          >
            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <HiBell className="mx-auto text-3xl text-gray-700 mb-3" />

                <p className="text-xs font-semibold text-gray-400">
                  No notifications yet
                </p>

                <p className="text-[10px] text-gray-600 mt-1">
                  New notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/60">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleMarkAsRead(notif._id, notif.isRead)}
                    className={`
                      group
                      flex
                      items-start
                      gap-3
                      p-3.5
                      sm:p-4
                      cursor-pointer
                      transition

                      ${
                        notif.isRead
                          ? "bg-[#161920] hover:bg-[#1b1e26]"
                          : "bg-purple-600/10 hover:bg-purple-600/15"
                      }
                    `}
                  >
                    {/* Notification Icon */}

                    <div
                      className={`
                        shrink-0
                        w-8
                        h-8
                        sm:w-9
                        sm:h-9
                        rounded-xl
                        flex
                        items-center
                        justify-center

                        ${
                          notif.isRead
                            ? "bg-gray-800 text-gray-500"
                            : "bg-purple-500/15 text-purple-400"
                        }
                      `}
                    >
                      <HiBell className="text-sm sm:text-base" />
                    </div>

                    {/* Content */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!notif.isRead && (
                          <span
                            className="
                              px-1.5
                              py-0.5
                              rounded-md
                              bg-purple-600
                              text-white
                              text-[8px]
                              sm:text-[9px]
                              font-black
                              uppercase
                            "
                          >
                            New
                          </span>
                        )}

                        <span className="text-[9px] sm:text-[10px] text-gray-500">
                          {notif?.createdAt
                            ? new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>

                      <p
                        className={`
                          text-[11px]
                          sm:text-xs
                          leading-relaxed
                          break-words
                          mt-1.5
                          pr-1

                          ${
                            notif.isRead
                              ? "text-gray-400"
                              : "text-gray-200 font-medium"
                          }
                        `}
                      >
                        {notif.message}
                      </p>
                    </div>

                    {/* Delete */}

                    <button
                      type="button"
                      onClick={(event) => handleDelete(event, notif._id)}
                      aria-label="Delete notification"
                      className="
                        shrink-0
                        p-1.5
                        rounded-lg
                        text-gray-600
                        hover:text-rose-400
                        hover:bg-rose-500/10
                        transition
                        cursor-pointer
                        opacity-70
                        sm:opacity-0
                        sm:group-hover:opacity-100
                      "
                    >
                      <HiTrash className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

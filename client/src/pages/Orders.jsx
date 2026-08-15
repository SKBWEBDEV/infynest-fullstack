// File Path: src/pages/MyOrders.jsx

import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import {
  HiOutlineShoppingBag,
  HiClock,
  HiCheckCircle,
  HiTruck,
  HiXCircle,
} from "react-icons/hi";
import toast from "react-hot-toast";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
  try {
    setLoading(true);

    // ==========================================
    // GET LOGGED-IN USER FROM LOCAL STORAGE
    // ==========================================

    const storedUser = localStorage.getItem("userInfo");

    // User login না করলে কোনো API request যাবে না
    if (!storedUser) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let userInfo;

    try {
      userInfo = JSON.parse(storedUser);
    } catch (parseError) {
      console.error("Invalid userInfo in localStorage:", parseError);

      // Corrupted userInfo থাকলে remove করে দিচ্ছি
      localStorage.removeItem("userInfo");

      setOrders([]);
      setLoading(false);
      return;
    }

    // ==========================================
    // CHECK TOKEN
    // ==========================================

    const token = userInfo?.token;

    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    // ==========================================
    // FETCH ONLY LOGGED-IN USER'S ORDERS
    // ==========================================

    const response = await API.get("/orders/myorders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("My Orders Response:", response.data);

    // ==========================================
    // SET ORDERS
    // ==========================================

    if (Array.isArray(response.data?.data)) {
      setOrders(response.data.data);
    } else if (Array.isArray(response.data?.orders)) {
      setOrders(response.data.orders);
    } else if (Array.isArray(response.data)) {
      setOrders(response.data);
    } else {
      setOrders([]);
    }

  } catch (error) {
    console.error("Error fetching orders:", error);

    // Unauthorized / expired token
    if (error.response?.status === 401) {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");

      setOrders([]);

      toast.error("Your session has expired. Please login again.");

      return;
    }

    toast.error(
      error.response?.data?.message || "Failed to fetch orders"
    );

    setOrders([]);

  } finally {
    setLoading(false);
  }
};

  // ==========================================
  // STATUS BADGE
  // ==========================================

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            <HiCheckCircle size={14} />
            Delivered
          </span>
        );

      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
            <HiTruck size={14} />
            Shipped
          </span>
        );

      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
            <HiClock size={14} />
            Processing
          </span>
        );

      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
            <HiCheckCircle size={14} />
            Confirmed
          </span>
        );

      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
            <HiXCircle size={14} />
            Cancelled
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
            <HiClock size={14} />
            Pending
          </span>
        );
    }
  };

  // ==========================================
  // STATUS TIMELINE
  // ==========================================

  const statusSteps = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const getStatusIndex = (status) => {
    return statusSteps.indexOf(status);
  };

  const isStatusCompleted = (order, status) => {
    const currentIndex = getStatusIndex(order.orderStatus);
    const stepIndex = getStatusIndex(status);

    if (order.orderStatus === "Cancelled") {
      return false;
    }

    return currentIndex >= stepIndex;
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />

          <p className="text-xs text-gray-500 mt-4">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">

        {/* ======================================
            PAGE HEADER
        ====================================== */}

        <div className="relative mb-8 sm:mb-10">
          <div className="absolute -top-10 left-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/15 border border-purple-500/20 flex items-center justify-center">
                  <HiOutlineShoppingBag
                    size={20}
                    className="text-purple-400"
                  />
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  My Orders
                </h1>
              </div>

              <p className="text-[11px] sm:text-xs text-gray-500 mt-2 ml-11">
                Track and manage your orders
              </p>
            </div>

            <div className="shrink-0 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
              <span className="text-[10px] sm:text-xs font-bold text-gray-400">
                {orders.length}{" "}
                {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
          </div>
        </div>

        {/* ======================================
            EMPTY ORDERS
        ====================================== */}

        {orders.length === 0 ? (
          <div className="relative overflow-hidden bg-[#0b0b0d] border border-white/10 rounded-3xl p-10 sm:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/5" />

            <div className="relative">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                <HiOutlineShoppingBag
                  size={30}
                  className="text-purple-400"
                />
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white mt-5">
                No Orders Yet
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                You haven't placed any orders yet.
              </p>

              <Link
                to="/shop"
                className="inline-flex mt-6 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-lg shadow-purple-600/20"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="
                  relative
                  overflow-hidden
                  bg-[#0b0b0d]
                  border
                  border-white/10
                  rounded-2xl
                  sm:rounded-3xl
                  shadow-2xl
                  shadow-black/40
                  hover:border-purple-500/20
                  transition
                "
              >
                {/* TOP GLOW */}

                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                <div className="p-4 sm:p-6 space-y-5">

                  {/* ==================================
                      ORDER HEADER
                  ================================== */}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">

                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Order ID
                      </p>

                      <p className="font-mono text-sm font-bold text-white mt-1">
                        #{order._id.slice(-8)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Order Date
                      </p>

                      <p className="text-xs font-semibold text-gray-300 mt-1">
                        {new Date(
                          order.createdAt,
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div>
                      {getStatusBadge(
                        order.orderStatus || "Pending",
                      )}
                    </div>
                  </div>

                  {/* ==================================
                      TIMELINE
                  ================================== */}

                  <div className="bg-black border border-white/[0.07] rounded-2xl p-4 sm:p-5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-5">
                      Order Status
                    </p>

                    <div className="flex items-center justify-between">
                      {statusSteps.map((status, index) => {
                        const completed =
                          isStatusCompleted(order, status);

                        const isCurrent =
                          order.orderStatus === status;

                        return (
                          <React.Fragment key={status}>
                            <div className="flex flex-col items-center min-w-0">
                              <div
                                className={`
                                  w-7 h-7 sm:w-9 sm:h-9
                                  rounded-full
                                  flex
                                  items-center
                                  justify-center
                                  border-2
                                  transition
                                  ${
                                    completed
                                      ? "bg-purple-600 border-purple-500 text-white"
                                      : "bg-[#111113] border-gray-800 text-gray-700"
                                  }
                                  ${
                                    isCurrent
                                      ? "ring-4 ring-purple-500/10"
                                      : ""
                                  }
                                `}
                              >
                                {completed ? (
                                  <HiCheckCircle className="text-sm sm:text-base" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                                )}
                              </div>

                              <span
                                className={`
                                  mt-2
                                  text-[7px]
                                  sm:text-[9px]
                                  font-bold
                                  text-center
                                  ${
                                    completed
                                      ? "text-purple-400"
                                      : "text-gray-600"
                                  }
                                `}
                              >
                                {status}
                              </span>
                            </div>

                            {index <
                              statusSteps.length - 1 && (
                              <div
                                className={`
                                  h-[2px]
                                  flex-1
                                  mx-1
                                  sm:mx-2
                                  ${
                                    getStatusIndex(
                                      order.orderStatus,
                                    ) > index
                                      ? "bg-purple-600"
                                      : "bg-gray-800"
                                  }
                                `}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {order.orderStatus === "Cancelled" && (
                      <div className="mt-5 pt-4 border-t border-white/[0.07] flex items-center justify-center">
                        <span className="flex items-center gap-2 text-xs font-bold text-red-400">
                          <HiXCircle size={16} />
                          This order has been cancelled
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ==================================
                      ORDER ACTIVITY
                  ================================== */}

                  {order.statusHistory?.length > 0 && (
                    <div className="bg-black border border-white/[0.07] rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-white">
                          Order Activity
                        </h3>

                        <span className="text-[9px] text-gray-600">
                          Status History
                        </span>
                      </div>

                      <div className="space-y-3">
                        {[...order.statusHistory]
                          .reverse()
                          .map((history, index) => (
                            <div
                              key={`${history.status}-${history.changedAt}-${index}`}
                              className="flex items-start gap-3"
                            >
                              <div className="flex flex-col items-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 mt-1" />

                                {index <
                                  order.statusHistory.length - 1 && (
                                  <div className="w-px h-7 bg-gray-800 mt-1" />
                                )}
                              </div>

                              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <div>
                                  <p className="text-xs font-bold text-white">
                                    {history.status}
                                  </p>

                                  <p className="text-[10px] text-gray-600 mt-0.5">
                                    Order status updated
                                  </p>
                                </div>

                                <p className="text-[9px] text-gray-600">
                                  {new Date(
                                    history.changedAt,
                                  ).toLocaleString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* ==================================
                      PRODUCTS
                  ================================== */}

                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">
                      Products
                    </p>

                    <div className="space-y-2">
                      {order.orderItems?.map((item, idx) => (
                        <div
                          key={idx}
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                            bg-black
                            border
                            border-white/[0.07]
                            p-3
                            rounded-xl
                            hover:border-white/10
                            transition
                          "
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={
                                item.image?.startsWith("http")
                                  ? item.image
                                  : `${import.meta.env.VITE_API_URL}/${item.image}`
                              }
                              alt={item.name}
                              className="
                                w-14
                                h-14
                                sm:w-16
                                sm:h-16
                                object-cover
                                rounded-xl
                                bg-[#111113]
                                border
                                border-white/10
                                shrink-0
                              "
                            />

                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-white truncate">
                                {item.name}
                              </p>

                              <p className="text-[10px] text-gray-500 mt-1">
                                Qty: {item.quantity || item.qty}
                              </p>

                              {item.size &&
                                item.size !== "N/A" && (
                                  <p className="text-[10px] text-gray-500">
                                    Size: {item.size}
                                  </p>
                                )}

                              {item.color &&
                                item.color !== "N/A" && (
                                  <p className="text-[10px] text-gray-500">
                                    Color: {item.color}
                                  </p>
                                )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-sm font-black text-purple-400">
                              ৳
                              {Number(
                                item.price || 0,
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ==================================
                      PAYMENT + ADDRESS
                  ================================== */}

                  <div className="pt-4 border-t border-white/[0.07] grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="bg-black border border-white/[0.07] rounded-xl p-3">
                      <p className="text-[9px] text-gray-600 uppercase tracking-wider">
                        Payment
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-bold text-white">
                          {order.paymentMethod}
                        </span>

                        <span
                          className={`
                            px-2
                            py-0.5
                            rounded-full
                            text-[9px]
                            font-bold
                            ${
                              order.paymentStatus === "Paid"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }
                          `}
                        >
                          {order.paymentStatus || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-black border border-white/[0.07] rounded-xl p-3">
                      <p className="text-[9px] text-gray-600 uppercase tracking-wider">
                        Shipping Address
                      </p>

                      <p className="text-xs text-gray-300 mt-1.5">
                        {order.shippingAddress}
                      </p>
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
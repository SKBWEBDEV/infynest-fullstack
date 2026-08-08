
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
      const token =
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("userInfo"))?.token;

      if (!token) {
        toast.error("Please login to view your orders");
        setLoading(false);
        return;
      }

      const response = await API.get("/orders/myorders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setOrders(response.data.data);
      } else if (Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);

      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // STATUS BADGE
  // -----------------------------------------
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            <HiCheckCircle />
            Delivered
          </span>
        );

      case "shipped":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
            <HiTruck />
            Shipped
          </span>
        );

      case "processing":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
            <HiClock />
            Processing
          </span>
        );

      case "confirmed":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
            <HiCheckCircle />
            Confirmed
          </span>
        );

      case "cancelled":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
            <HiXCircle />
            Cancelled
          </span>
        );

      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
            <HiClock />
            Pending
          </span>
        );
    }
  };

  // -----------------------------------------
  // STATUS TIMELINE
  // -----------------------------------------
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

  // -----------------------------------------
  // LOADING
  // -----------------------------------------
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
          <HiOutlineShoppingBag className="text-purple-400" />
          My Orders ({orders.length})
        </h1>
      </div>

      {/* EMPTY ORDERS */}
      {orders.length === 0 ? (
        <div className="bg-[#161920] border border-gray-800 rounded-3xl p-12 text-center space-y-4">
          <p className="text-sm text-gray-400">
            You haven't placed any orders yet.
          </p>

          <Link
            to="/shop"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-[#161920] border border-gray-800/80 rounded-2xl p-5 space-y-5 shadow-xl"
            >
              {/* -----------------------------------------
                  ORDER HEADER
              ----------------------------------------- */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3 text-xs">
                <div>
                  <span className="text-gray-400">Order ID: </span>

                  <span className="font-mono font-bold text-white">
                    #{order._id.slice(-8)}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">Date: </span>

                  <span className="text-gray-300 font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div>{getStatusBadge(order.orderStatus || "Pending")}</div>
              </div>

              {/* -----------------------------------------
                  ORDER STATUS TIMELINE
              ----------------------------------------- */}

              <div className="bg-[#0f1115] border border-gray-800/60 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  {statusSteps.map((status, index) => {
                    const completed = isStatusCompleted(order, status);

                    const isCurrent = order.orderStatus === status;

                    return (
                      <React.Fragment key={status}>
                        <div className="flex flex-col items-center min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                              completed
                                ? "bg-purple-600 border-purple-500 text-white"
                                : "bg-[#161920] border-gray-700 text-gray-600"
                            } ${isCurrent ? "ring-4 ring-purple-500/10" : ""}`}
                          >
                            {completed ? (
                              <HiCheckCircle className="text-sm" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-gray-600" />
                            )}
                          </div>

                          <span
                            className={`mt-2 text-[9px] sm:text-[10px] font-bold text-center ${
                              completed ? "text-purple-400" : "text-gray-500"
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        {index < statusSteps.length - 1 && (
                          <div
                            className={`h-[2px] flex-1 mx-1 sm:mx-2 ${
                              getStatusIndex(order.orderStatus) > index
                                ? "bg-purple-600"
                                : "bg-gray-700"
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* CANCELLED */}
                {order.orderStatus === "Cancelled" && (
                  <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-center">
                    <span className="flex items-center gap-2 text-xs font-bold text-red-400">
                      <HiXCircle />
                      This order has been cancelled
                    </span>
                  </div>
                )}
              </div>

              {/* -----------------------------------------
                  STATUS HISTORY
              ----------------------------------------- */}

              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="bg-[#0f1115] border border-gray-800/60 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black text-white">
                      Order Activity
                    </h3>

                    <span className="text-[9px] text-gray-500">
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

                            {index < order.statusHistory.length - 1 && (
                              <div className="w-px h-7 bg-gray-700 mt-1" />
                            )}
                          </div>

                          <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-white">
                                {history.status}
                              </p>

                              <p className="text-[10px] text-gray-500">
                                Order status updated
                              </p>
                            </div>

                            <p className="text-[10px] text-gray-500">
                              {new Date(history.changedAt).toLocaleString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* -----------------------------------------
                  PRODUCTS
              ----------------------------------------- */}

              <div className="space-y-3">
                {order.orderItems &&
                  order.orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-4 bg-[#0f1115] p-3 rounded-xl border border-gray-800/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            item.image?.startsWith("http")
                              ? item.image
                              : `${import.meta.env.VITE_API_URL}/${item.image}`
                          }
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg bg-gray-900 border border-gray-800 shrink-0"
                        />

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {item.name}
                          </p>

                          <p className="text-[10px] text-gray-400 mt-1">
                            Qty: {item.quantity || item.qty}
                          </p>

                          {item.size && item.size !== "N/A" && (
                            <p className="text-[10px] text-gray-400">
                              Size: {item.size}
                            </p>
                          )}

                          {item.color && item.color !== "N/A" && (
                            <p className="text-[10px] text-gray-400">
                              Color: {item.color}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-purple-400">
                          ৳{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* -----------------------------------------
                  PAYMENT + ADDRESS
              ----------------------------------------- */}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs border-t border-gray-800/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-gray-400">
                    Payment Method:{" "}
                    <span className="font-bold text-white">
                      {order.paymentMethod}
                    </span>
                  </p>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.paymentStatus === "Paid"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {order.paymentStatus || "Pending"}
                  </span>
                </div>

                <p className="text-gray-400">
                  Address:{" "}
                  <span className="text-gray-300">{order.shippingAddress}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

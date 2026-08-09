// File Path: src/pages/admin/AdminOrders.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiClipboardList,
  HiUser,
  HiPhone,
  HiLocationMarker,
  HiArrowLeft,
  HiSearch,
  HiRefresh,
  HiCreditCard,
} from "react-icons/hi";

import API, { getImageUrl } from "../../services/api";

export default function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  // Status update loading
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // --------------------------------------------------
  // FETCH ALL ORDERS
  // --------------------------------------------------
  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);

      const response = await API.get("/orders");

      console.log("Admin Orders Response:", response.data);

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
      console.error("Error fetching admin orders:", error);

      toast.error(
        error.response?.data?.message || "Failed to fetch all orders",
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UPDATE ORDER STATUS
  // --------------------------------------------------
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      if (response.data?.success) {
        toast.success(`Order status changed to ${newStatus}`);

        // Update UI immediately
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  orderStatus: newStatus,
                }
              : order,
          ),
        );

        // Refresh from database
        await fetchAllOrders();
      } else {
        toast.error(response.data?.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Update status error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update order status",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // --------------------------------------------------
  // SEARCH + FILTER
  // --------------------------------------------------
  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase().trim();

    const orderId = order?._id?.toLowerCase() || "";
    const customerName = order?.customerName?.toLowerCase() || "";
    const phone = order?.phone || "";
    const email = order?.user?.email?.toLowerCase() || "";

    const matchesSearch =
      !search ||
      orderId.includes(search) ||
      customerName.includes(search) ||
      phone.includes(search) ||
      email.includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      (order?.orderStatus || "Pending") === statusFilter;

    const matchesPayment =
      paymentFilter === "All" || order?.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // --------------------------------------------------
  // STATUS BADGE
  // --------------------------------------------------
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[11px] font-bold">
            Delivered
          </span>
        );

      case "shipped":
        return (
          <span className="text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-[11px] font-bold">
            Shipped
          </span>
        );

      case "processing":
        return (
          <span className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[11px] font-bold">
            Processing
          </span>
        );

      case "confirmed":
        return (
          <span className="text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-[11px] font-bold">
            Confirmed
          </span>
        );

      case "cancelled":
        return (
          <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-[11px] font-bold">
            Cancelled
          </span>
        );

      default:
        return (
          <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[11px] font-bold">
            Pending
          </span>
        );
    }
  };

  // --------------------------------------------------
  // PAYMENT STATUS BADGE
  // --------------------------------------------------
  const getPaymentStatusBadge = (order) => {
    if (order?.isPaid || order?.paymentStatus === "Paid") {
      return (
        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
          Paid
        </span>
      );
    }

    if (order?.paymentStatus === "Failed") {
      return (
        <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
          Failed
        </span>
      );
    }

    return (
      <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
        Pending
      </span>
    );
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-purple-500" />

          <p className="text-xs text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* -------------------------------------------
            HEADER
        -------------------------------------------- */}
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
              <HiClipboardList className="text-purple-400" />
              Admin Orders ({filteredOrders.length})
            </h1>
          </div>

          <button
            onClick={fetchAllOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            <HiRefresh className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* -------------------------------------------
            SEARCH + FILTER
        -------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#161920] p-4 rounded-2xl border border-gray-800">
          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute left-3.5 top-3.5 text-gray-400 text-base" />

            <input
              type="text"
              placeholder="Search Order ID, Name, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1115] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Status */}
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

          {/* Payment */}
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

        {/* -------------------------------------------
            EMPTY STATE
        -------------------------------------------- */}
        {filteredOrders.length === 0 ? (
          <div className="bg-[#161920] border border-gray-800 rounded-3xl p-12 text-center space-y-4">
            <HiClipboardList className="mx-auto text-4xl text-gray-700" />

            <p className="text-sm text-gray-400">No matching orders found.</p>

            {(searchTerm ||
              statusFilter !== "All" ||
              paymentFilter !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setPaymentFilter("All");
                }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* -----------------------------------------
              ORDERS
          ------------------------------------------ */
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const orderStatus = order.orderStatus || "Pending";

              const totalAmount = order.totalAmount ?? order.totalPrice ?? 0;

              return (
                <div
                  key={order._id}
                  className="bg-[#161920] border border-gray-800/80 rounded-3xl p-5 md:p-6 space-y-5 shadow-xl"
                >
                  {/* ---------------------------------
                      ORDER HEADER
                  ---------------------------------- */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Order ID
                      </p>

                      <p className="font-mono font-bold text-white text-xs break-all">
                        #{order._id}
                      </p>
                    </div>

                    <div className="text-xs">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                        Date
                      </p>

                      <p className="text-gray-300 font-medium">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>

                    <div>{getStatusBadge(orderStatus)}</div>
                  </div>

                  {/* ---------------------------------
                      CUSTOMER INFO
                  ---------------------------------- */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-[#0f1115] p-4 rounded-2xl border border-gray-800/60">
                    {/* Name */}
                    <div className="space-y-1">
                      <p className="text-gray-400 flex items-center gap-1.5">
                        <HiUser className="text-purple-400" />
                        Customer Name
                      </p>

                      <p className="font-bold text-white text-sm">
                        {order.customerName || order.user?.name || "N/A"}
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <p className="text-gray-400 flex items-center gap-1.5">
                        <HiPhone className="text-purple-400" />
                        Phone Number
                      </p>

                      <p className="font-bold text-white text-sm">
                        {order.phone || "N/A"}
                      </p>
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                      <p className="text-gray-400 flex items-center gap-1.5">
                        <HiLocationMarker className="text-purple-400" />
                        Shipping Address
                      </p>

                      <p className="font-bold text-white text-sm line-clamp-2">
                        {order.shippingAddress || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* ---------------------------------
                      ORDER ITEMS
                  ---------------------------------- */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Ordered Items
                    </h4>

                    {Array.isArray(order.orderItems) &&
                      order.orderItems.map((item, index) => {
                        const imageUrl = getImageUrl(item.image);

                        return (
                          <div
                            key={item._id || `${order._id}-${index}`}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f1115] p-3 rounded-2xl border border-gray-800"
                          >
                            {/* Product */}
                            <div className="flex items-center gap-4 min-w-0">
                              <img
                                src={imageUrl}
                                alt={item.name || "Product"}
                                className="w-16 h-16 object-cover rounded-xl bg-gray-900 border border-gray-800 shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.png";
                                }}
                              />

                              <div className="space-y-1 min-w-0">
                                <h5 className="font-bold text-white text-xs md:text-sm line-clamp-2">
                                  {item.name || "Unnamed Product"}
                                </h5>

                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                                  <span>
                                    Price:{" "}
                                    <strong className="text-purple-400">
                                      ৳
                                      {Number(item.price || 0).toLocaleString()}
                                    </strong>
                                  </span>

                                  <span>
                                    Qty:{" "}
                                    <strong className="text-white">
                                      {item.quantity || 0}
                                    </strong>
                                  </span>

                                  {item.size && item.size !== "N/A" && (
                                    <span>
                                      Size:{" "}
                                      <strong className="text-white">
                                        {item.size}
                                      </strong>
                                    </span>
                                  )}

                                  {item.color && item.color !== "N/A" && (
                                    <span>
                                      Color:{" "}
                                      <strong className="text-white">
                                        {item.color}
                                      </strong>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Item subtotal */}
                            <div className="text-left sm:text-right shrink-0">
                              <p className="text-[10px] text-gray-500">
                                Subtotal
                              </p>

                              <p className="text-sm font-bold text-white">
                                ৳
                                {(
                                  Number(item.price || 0) *
                                  Number(item.quantity || 0)
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* ---------------------------------
                      PAYMENT INFO
                  ---------------------------------- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                    {/* Payment method */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <HiCreditCard className="text-purple-400" />
                        Payment Information
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {order.paymentMethod || "Cash on Delivery"}
                        </span>

                        {getPaymentStatusBadge(order)}
                      </div>

                      {/* Online payment details */}
                      {order.paymentMethod &&
                        order.paymentMethod !== "Cash on Delivery" && (
                          <div className="space-y-1 text-[11px] text-gray-400">
                            <p>
                              Sender:{" "}
                              <strong className="text-white">
                                {order.senderNumber || "N/A"}
                              </strong>
                            </p>

                            <p>
                              TrxID:{" "}
                              <strong className="text-purple-400 font-mono">
                                {order.transactionId || "N/A"}
                              </strong>
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className="flex items-end justify-between md:justify-end gap-6">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-gray-400">Total Amount</p>

                        <p className="text-xl font-black text-purple-400">
                          ৳{Number(totalAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ---------------------------------
                      STATUS UPDATE
                  ---------------------------------- */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-800">
                    <div>
                      <p className="text-xs font-bold text-gray-300">
                        Order Status
                      </p>

                      <p className="text-[10px] text-gray-500 mt-1">
                        Update the current order status
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {updatingOrderId === order._id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500" />
                      )}

                      <select
                        value={orderStatus}
                        disabled={updatingOrderId === order._id}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="bg-[#0f1115] border border-purple-500/50 text-purple-300 font-bold px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-400 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

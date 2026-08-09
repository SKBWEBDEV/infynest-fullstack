// File Path: src/pages/admin/AdminOrders.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  HiDownload,
  HiEye,
  HiX,
  HiCalendar,
  HiClock,
} from "react-icons/hi";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import API, { getImageUrl } from "../../services/api";

export default function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // SEARCH & FILTERS
  // --------------------------------------------------

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // --------------------------------------------------
  // MODAL
  // --------------------------------------------------

  const [selectedOrder, setSelectedOrder] = useState(null);

  // --------------------------------------------------
  // STATUS UPDATE
  // --------------------------------------------------

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // --------------------------------------------------
  // PDF
  // --------------------------------------------------

  const [pdfOrderId, setPdfOrderId] = useState(null);
  const pdfGeneratingRef = useRef(false);

  // --------------------------------------------------
  // FETCH ORDERS
  // --------------------------------------------------

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // --------------------------------------------------
  // ESC CLOSE MODAL
  // --------------------------------------------------

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedOrder(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // --------------------------------------------------
  // BODY SCROLL LOCK
  // --------------------------------------------------

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedOrder]);

  // --------------------------------------------------
  // FETCH ALL ORDERS
  // --------------------------------------------------

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
    if (!orderId || !newStatus) return;

    try {
      setUpdatingOrderId(orderId);

      const response = await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      if (response.data?.success) {
        toast.success(`Order status changed to ${newStatus}`);

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order?._id === orderId
              ? {
                  ...order,
                  orderStatus: newStatus,
                }
              : order,
          ),
        );

        setSelectedOrder((prev) =>
          prev && prev._id === orderId
            ? {
                ...prev,
                orderStatus: newStatus,
              }
            : prev,
        );

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
  // DATE HELPERS
  // --------------------------------------------------

  const getDateKey = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const todayKey = getDateKey(new Date());

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  const yesterdayKey = getDateKey(yesterdayDate);

  // --------------------------------------------------
  // SEARCH + FILTER
  // --------------------------------------------------

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const search = searchTerm.toLowerCase().trim();

      const orderId = String(order?._id || "").toLowerCase();

      const customerName = String(
        order?.customerName || order?.user?.name || "",
      ).toLowerCase();

      const phone = String(order?.phone || "").toLowerCase();

      const email = String(
        order?.email || order?.user?.email || "",
      ).toLowerCase();

      const productNames = Array.isArray(order?.orderItems)
        ? order.orderItems
            .map((item) => String(item?.name || "").toLowerCase())
            .join(" ")
        : "";

      const matchesSearch =
        !search ||
        orderId.includes(search) ||
        customerName.includes(search) ||
        phone.includes(search) ||
        email.includes(search) ||
        productNames.includes(search);

      const currentStatus = order?.orderStatus || "Pending";

      const matchesStatus =
        statusFilter === "All" || currentStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "All" || order?.paymentMethod === paymentFilter;

      const matchesDate =
        !dateFilter || getDateKey(order?.createdAt) === dateFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter, dateFilter]);

  // --------------------------------------------------
  // GROUP ORDERS
  // --------------------------------------------------

  const groupedOrders = useMemo(() => {
    const today = [];
    const yesterday = [];
    const previous = [];

    filteredOrders.forEach((order) => {
      const orderDateKey = getDateKey(order?.createdAt);

      if (orderDateKey === todayKey) {
        today.push(order);
      } else if (orderDateKey === yesterdayKey) {
        yesterday.push(order);
      } else {
        previous.push(order);
      }
    });

    const sortNewest = (a, b) => {
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    };

    today.sort(sortNewest);
    yesterday.sort(sortNewest);
    previous.sort(sortNewest);

    return {
      today,
      yesterday,
      previous,
    };
  }, [filteredOrders, todayKey, yesterdayKey]);

  // --------------------------------------------------
  // STATUS BADGE
  // --------------------------------------------------

  const getStatusBadge = (status) => {
    switch (String(status || "").toLowerCase()) {
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
    if (
      order?.isPaid === true ||
      String(order?.paymentStatus || "").toLowerCase() === "paid"
    ) {
      return (
        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
          Paid
        </span>
      );
    }

    if (String(order?.paymentStatus || "").toLowerCase() === "failed") {
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
  // TOTAL HELPERS
  // --------------------------------------------------

  const calculateSubtotal = (order) => {
    if (order?.itemsPrice !== undefined && order?.itemsPrice !== null) {
      return Number(order.itemsPrice || 0);
    }

    if (order?.subtotal !== undefined && order?.subtotal !== null) {
      return Number(order.subtotal || 0);
    }

    if (Array.isArray(order?.orderItems)) {
      return order.orderItems.reduce((sum, item) => {
        return sum + Number(item?.price || 0) * Number(item?.quantity || 0);
      }, 0);
    }

    return 0;
  };

  const calculateGrandTotal = (order) => {
    if (order?.totalAmount !== undefined && order?.totalAmount !== null) {
      return Number(order.totalAmount || 0);
    }

    if (order?.totalPrice !== undefined && order?.totalPrice !== null) {
      return Number(order.totalPrice || 0);
    }

    const subtotal = calculateSubtotal(order);
    const shippingFee = Number(order?.shippingFee || 0);

    return subtotal + shippingFee;
  };

  // --------------------------------------------------
  // FORMAT MONEY
  // --------------------------------------------------

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString("en-BD");
  };

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // --------------------------------------------------
  // ADDRESS
  // --------------------------------------------------

  const getAddress = (order) => {
    if (!order?.shippingAddress) {
      return "N/A";
    }

    if (typeof order.shippingAddress === "object") {
      const address = [
        order.shippingAddress?.street,
        order.shippingAddress?.area,
        order.shippingAddress?.city,
        order.shippingAddress?.district,
      ]
        .filter(Boolean)
        .join(", ");

      return address || "N/A";
    }

    return String(order.shippingAddress);
  };

  // --------------------------------------------------
  // DOWNLOAD ORDER PDF
  // --------------------------------------------------

  const downloadOrderPDF = async (order) => {
    if (pdfGeneratingRef.current) return;

    if (!order) {
      toast.error("Order information not found");
      return;
    }

    pdfGeneratingRef.current = true;

    try {
      setPdfOrderId(order?._id);

      const doc = new jsPDF();

      const orderId = order?._id || "N/A";
      const orderStatus = order?.orderStatus || "Pending";

      const subtotal = calculateSubtotal(order);
      const shippingFee = Number(order?.shippingFee || 0);
      const grandTotal = calculateGrandTotal(order);

      const customerName = order?.customerName || order?.user?.name || "N/A";

      const phone = order?.phone || "N/A";

      const email = order?.email || order?.user?.email || "N/A";

      const address = getAddress(order);

      const deliveryArea = order?.deliveryArea || "N/A";

      const paymentMethod = order?.paymentMethod || "Cash on Delivery";

      // --------------------------------------------------
      // HEADER
      // --------------------------------------------------

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("ORDER INVOICE", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(`Order ID: #${orderId}`, 14, 29);
      doc.text(`Order Date: ${formatDate(order?.createdAt)}`, 14, 35);
      doc.text(`Status: ${orderStatus}`, 14, 41);

      // --------------------------------------------------
      // CUSTOMER INFORMATION
      // --------------------------------------------------

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Customer Information", 14, 53);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(`Name: ${customerName}`, 14, 61);
      doc.text(`Phone: ${phone}`, 14, 67);
      doc.text(`Email: ${email}`, 14, 73);

      const addressLines = doc.splitTextToSize(`Address: ${address}`, 180);

      doc.text(addressLines, 14, 79);

      const customerEndY = 79 + addressLines.length * 5;

      // --------------------------------------------------
      // PAYMENT INFORMATION
      // --------------------------------------------------

      const paymentStartY = customerEndY + 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Information", 14, paymentStartY);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(`Payment Method: ${paymentMethod}`, 14, paymentStartY + 8);

      doc.text(`Delivery Area: ${deliveryArea}`, 14, paymentStartY + 14);

      if (paymentMethod !== "Cash on Delivery") {
        doc.text(
          `Sender Number: ${order?.senderNumber || "N/A"}`,
          14,
          paymentStartY + 20,
        );

        doc.text(
          `Transaction ID: ${order?.transactionId || "N/A"}`,
          14,
          paymentStartY + 26,
        );
      }

      // --------------------------------------------------
      // ORDER ITEMS
      // --------------------------------------------------

      const paymentRows = paymentMethod !== "Cash on Delivery" ? 32 : 20;

      const itemsStartY = paymentStartY + paymentRows;

      const tableData = Array.isArray(order?.orderItems)
        ? order.orderItems.map((item, index) => {
            const price = Number(item?.price || 0);
            const quantity = Number(item?.quantity || 0);

            const itemTotal = price * quantity;

            return [
              index + 1,
              item?.name || "Unnamed Product",
              item?.size || "-",
              item?.color || "-",
              quantity,
              `BDT ${formatMoney(price)}`,
              `BDT ${formatMoney(itemTotal)}`,
            ];
          })
        : [];

      autoTable(doc, {
        startY: itemsStartY,
        head: [["#", "Product", "Size", "Color", "Qty", "Price", "Total"]],
        body: tableData,
        theme: "grid",

        styles: {
          fontSize: 8,
          cellPadding: 3,
        },

        headStyles: {
          fontStyle: "bold",
        },

        columnStyles: {
          0: {
            cellWidth: 10,
          },

          1: {
            cellWidth: 45,
          },

          2: {
            cellWidth: 18,
          },

          3: {
            cellWidth: 22,
          },

          4: {
            cellWidth: 15,
            halign: "center",
          },

          5: {
            cellWidth: 30,
            halign: "right",
          },

          6: {
            cellWidth: 30,
            halign: "right",
          },
        },

        margin: {
          left: 14,
          right: 14,
        },
      });

      // --------------------------------------------------
      // SUMMARY
      // --------------------------------------------------

      const finalY = doc.lastAutoTable?.finalY || itemsStartY + 20;

      const summaryX = 135;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text("Subtotal:", summaryX, finalY + 12);

      doc.text(`BDT ${formatMoney(subtotal)}`, 195, finalY + 12, {
        align: "right",
      });

      doc.text("Shipping Fee:", summaryX, finalY + 20);

      doc.text(`BDT ${formatMoney(shippingFee)}`, 195, finalY + 20, {
        align: "right",
      });

      doc.setFont("helvetica", "bold");

      doc.text("Grand Total:", summaryX, finalY + 30);

      doc.text(`BDT ${formatMoney(grandTotal)}`, 195, finalY + 30, {
        align: "right",
      });

      // --------------------------------------------------
      // FOOTER
      // --------------------------------------------------

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      doc.text("Thank you for your order!", 105, finalY + 44, {
        align: "center",
      });

      doc.text("This is a computer-generated invoice.", 105, finalY + 50, {
        align: "center",
      });

      // --------------------------------------------------
      // SAVE
      // --------------------------------------------------

      const safeOrderId = String(orderId).replace(/[^a-zA-Z0-9-_]/g, "");

      doc.save(`Order-${safeOrderId || "Invoice"}.pdf`);

      toast.success("Order PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);

      toast.error("Failed to generate order PDF");
    } finally {
      setPdfOrderId(null);
      pdfGeneratingRef.current = false;
    }
  };

  // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setDateFilter("");
  };

  const hasFilters =
    Boolean(searchTerm) ||
    statusFilter !== "All" ||
    paymentFilter !== "All" ||
    Boolean(dateFilter);

  // --------------------------------------------------
  // ORDER CARD
  // --------------------------------------------------

  const OrderCard = ({ order }) => {
    const orderStatus = order?.orderStatus || "Pending";

    const totalAmount = calculateGrandTotal(order);

    const itemCount = Array.isArray(order?.orderItems)
      ? order.orderItems.reduce(
          (sum, item) => sum + Number(item?.quantity || 0),
          0,
        )
      : 0;

    return (
      <div className="bg-[#161920] border border-gray-800/80 rounded-2xl p-4 md:p-5 shadow-lg hover:border-purple-500/30 transition">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* LEFT */}

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                Order
              </span>

              <span className="font-mono text-xs font-bold text-white break-all">
                #{order?._id || "N/A"}
              </span>

              {getStatusBadge(orderStatus)}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <span className="flex items-center gap-1.5 text-gray-400">
                <HiUser className="text-purple-400" />

                <strong className="text-gray-200">
                  {order?.customerName || order?.user?.name || "N/A"}
                </strong>
              </span>

              <span className="flex items-center gap-1.5 text-gray-400">
                <HiPhone className="text-purple-400" />

                <strong className="text-gray-200">
                  {order?.phone || "N/A"}
                </strong>
              </span>

              <span className="flex items-center gap-1.5 text-gray-400">
                <HiClock className="text-purple-400" />

                <strong className="text-gray-200">
                  {formatDate(order?.createdAt)}
                </strong>
              </span>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex items-center justify-between lg:justify-end gap-4">
            <div className="text-left lg:text-right">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                Items
              </p>

              <p className="text-sm font-bold text-white">{itemCount}</p>
            </div>

            <div className="text-left lg:text-right">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                Total
              </p>

              <p className="text-sm md:text-base font-black text-purple-400">
                BDT {formatMoney(totalAmount)}
              </p>
            </div>

            <button
              onClick={() => setSelectedOrder(order)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/20"
            >
              <HiEye size={16} />

              <span className="hidden sm:inline">View Details</span>

              <span className="sm:hidden">View</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // ORDER GROUP
  // --------------------------------------------------

  const OrderGroup = ({ title, orders: groupOrders, icon }) => {
    if (!groupOrders.length) return null;

    return (
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {icon}

            <h2 className="text-sm md:text-base font-black text-white">
              {title}
            </h2>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold">
            {groupOrders.length}
          </span>

          <div className="h-px bg-gray-800 flex-1" />
        </div>

        <div className="space-y-3">
          {groupOrders.map((order) => (
            <OrderCard key={order?._id} order={order} />
          ))}
        </div>
      </section>
    );
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#0f1115] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />

          <p className="text-sm text-gray-400 mt-4">Loading orders...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 md:p-6 space-y-5">
      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-[#161920] border border-gray-800 hover:bg-gray-800 text-white rounded-xl transition cursor-pointer"
            title="Go Back"
          >
            <HiArrowLeft className="text-lg" />
          </button>

          <div>
            <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <HiClipboardList className="text-purple-400" />
              Admin Orders
            </h1>

            <p className="text-[11px] text-gray-500 mt-1">
              {filteredOrders.length} matching order
              {filteredOrders.length !== 1 ? "s" : ""}
            </p>
          </div>
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

      {/* SEARCH + FILTERS */}

      <div className="bg-[#161920] p-4 rounded-2xl border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* SEARCH */}

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

          {/* DATE */}

          <div className="relative">
            <HiCalendar className="absolute left-3.5 top-3.5 text-gray-400 text-base pointer-events-none" />

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-[#0f1115] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
            />
          </div>

          {/* STATUS */}

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

          {/* PAYMENT */}

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

        {/* FILTER ACTIONS */}

        {hasFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-800">
            <div className="text-[11px] text-gray-500">Filters applied</div>

            <button
              onClick={clearFilters}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* QUICK DATE INFO */}

      {!dateFilter && !searchTerm && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#161920] border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              Today
            </p>

            <p className="text-lg font-black text-white mt-1">
              {groupedOrders.today.length}
            </p>
          </div>

          <div className="bg-[#161920] border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              Yesterday
            </p>

            <p className="text-lg font-black text-white mt-1">
              {groupedOrders.yesterday.length}
            </p>
          </div>

          <div className="bg-[#161920] border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              Previous
            </p>

            <p className="text-lg font-black text-white mt-1">
              {groupedOrders.previous.length}
            </p>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}

      {filteredOrders.length === 0 ? (
        <div className="bg-[#161920] border border-gray-800 rounded-2xl p-12 text-center space-y-4">
          <HiClipboardList className="mx-auto text-4xl text-gray-700" />

          <div>
            <p className="text-sm text-gray-300 font-bold">
              No matching orders found
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Try changing your search or filters.
            </p>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-7">
          <OrderGroup
            title="Today"
            orders={groupedOrders.today}
            icon={<HiClock className="text-purple-400" />}
          />

          <OrderGroup
            title="Yesterday"
            orders={groupedOrders.yesterday}
            icon={<HiCalendar className="text-blue-400" />}
          />

          <OrderGroup
            title="Previous Orders"
            orders={groupedOrders.previous}
            icon={<HiClipboardList className="text-gray-400" />}
          />
        </div>
      )}

      {/* ==================================================
          ORDER DETAILS MODAL
      ================================================== */}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <div
            className="w-full max-w-4xl max-h-[92vh] overflow-hidden bg-[#161920] border border-gray-800 rounded-3xl shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between gap-4 px-5 md:px-6 py-4 border-b border-gray-800 bg-[#161920]">
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Order Details
                </p>

                <h2 className="text-sm md:text-base font-black text-white font-mono break-all mt-1">
                  #{selectedOrder?._id || "N/A"}
                </h2>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition shrink-0"
                title="Close"
              >
                <HiX className="text-lg" />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="overflow-y-auto max-h-[calc(92vh-73px)] p-5 md:p-6 space-y-5">
              {/* ORDER TOP */}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Order Date
                  </p>

                  <p className="text-xs text-gray-300 font-medium">
                    {formatDate(selectedOrder?.createdAt)}
                  </p>
                </div>

                <div>
                  {getStatusBadge(selectedOrder?.orderStatus || "Pending")}
                </div>
              </div>

              {/* CUSTOMER INFO */}

              <div className="bg-[#0f1115] border border-gray-800 rounded-2xl p-4">
                <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider mb-4">
                  Customer Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* NAME */}

                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                      <HiUser className="text-purple-400" />
                      Customer Name
                    </p>

                    <p className="text-sm font-bold text-white break-words">
                      {selectedOrder?.customerName ||
                        selectedOrder?.user?.name ||
                        "N/A"}
                    </p>
                  </div>

                  {/* EMAIL */}

                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500">Email Address</p>

                    <p className="text-sm font-bold text-white break-all">
                      {selectedOrder?.email ||
                        selectedOrder?.user?.email ||
                        "N/A"}
                    </p>
                  </div>

                  {/* PHONE */}

                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                      <HiPhone className="text-purple-400" />
                      Phone Number
                    </p>

                    <p className="text-sm font-bold text-white">
                      {selectedOrder?.phone || "N/A"}
                    </p>
                  </div>

                  {/* DELIVERY AREA */}

                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                      <HiLocationMarker className="text-purple-400" />
                      Delivery Area
                    </p>

                    <p className="text-sm font-bold text-white">
                      {selectedOrder?.deliveryArea || "N/A"}
                    </p>
                  </div>

                  {/* ADDRESS */}

                  <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                    <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                      <HiLocationMarker className="text-purple-400" />
                      Shipping Address
                    </p>

                    <p className="text-sm font-bold text-white break-words">
                      {getAddress(selectedOrder)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ORDERED ITEMS */}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider">
                    Ordered Items
                  </h3>

                  <span className="text-[10px] text-gray-500">
                    {Array.isArray(selectedOrder?.orderItems)
                      ? selectedOrder.orderItems.length
                      : 0}{" "}
                    product
                    {Array.isArray(selectedOrder?.orderItems) &&
                    selectedOrder.orderItems.length !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>

                {Array.isArray(selectedOrder?.orderItems) &&
                selectedOrder.orderItems.length > 0 ? (
                  selectedOrder.orderItems.map((item, index) => {
                    const imageUrl = getImageUrl(item?.image);

                    const price = Number(item?.price || 0);

                    const quantity = Number(item?.quantity || 0);

                    const itemSubtotal = price * quantity;

                    return (
                      <div
                        key={item?._id || `${selectedOrder?._id}-${index}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f1115] p-3 rounded-2xl border border-gray-800"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={imageUrl || "/placeholder.png"}
                            alt={item?.name || "Product"}
                            className="w-16 h-16 object-cover rounded-xl bg-gray-900 border border-gray-800 shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.png";
                            }}
                          />

                          <div className="space-y-1 min-w-0">
                            <h4 className="font-bold text-white text-xs md:text-sm">
                              {item?.name || "Unnamed Product"}
                            </h4>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                              <span>
                                Price:{" "}
                                <strong className="text-purple-400">
                                  BDT {formatMoney(price)}
                                </strong>
                              </span>

                              <span>
                                Qty:{" "}
                                <strong className="text-white">
                                  {quantity}
                                </strong>
                              </span>

                              {item?.size && item.size !== "N/A" && (
                                <span>
                                  Size:{" "}
                                  <strong className="text-white">
                                    {item.size}
                                  </strong>
                                </span>
                              )}

                              {item?.color && item.color !== "N/A" && (
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

                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-[10px] text-gray-500">Subtotal</p>

                          <p className="text-sm font-black text-white">
                            BDT {formatMoney(itemSubtotal)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-[#0f1115] border border-gray-800 rounded-2xl p-6 text-center">
                    <p className="text-xs text-gray-500">
                      No order items found.
                    </p>
                  </div>
                )}
              </div>

              {/* PAYMENT */}

              <div className="bg-[#0f1115] border border-gray-800 rounded-2xl p-4">
                <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <HiCreditCard className="text-purple-400" />
                  Payment Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500">Payment Method</p>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-white">
                        {selectedOrder?.paymentMethod || "Cash on Delivery"}
                      </span>

                      {getPaymentStatusBadge(selectedOrder)}
                    </div>
                  </div>

                  {selectedOrder?.paymentMethod &&
                    selectedOrder.paymentMethod !== "Cash on Delivery" && (
                      <>
                        <div>
                          <p className="text-[10px] text-gray-500">
                            Sender Number
                          </p>

                          <p className="text-xs font-bold text-white mt-1">
                            {selectedOrder?.senderNumber || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-gray-500">
                            Transaction ID
                          </p>

                          <p className="text-xs font-mono font-bold text-purple-400 mt-1 break-all">
                            {selectedOrder?.transactionId || "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                </div>
              </div>

              {/* ORDER SUMMARY */}

              <div className="bg-[#0f1115] border border-gray-800 rounded-2xl p-4">
                <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Subtotal</span>

                    <span className="text-sm font-bold text-white">
                      BDT {formatMoney(calculateSubtotal(selectedOrder))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Delivery Area</span>

                    <span className="text-xs font-bold text-gray-300">
                      {selectedOrder?.deliveryArea || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Shipping Fee</span>

                    <span className="text-sm font-bold text-white">
                      BDT {formatMoney(selectedOrder?.shippingFee)}
                    </span>
                  </div>

                  <div className="border-t border-gray-800 mt-2 pt-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300">
                      Grand Total
                    </span>

                    <span className="text-lg font-black text-purple-400">
                      BDT {formatMoney(calculateGrandTotal(selectedOrder))}
                    </span>
                  </div>
                </div>
              </div>

              {/* STATUS HISTORY */}

              {Array.isArray(selectedOrder?.statusHistory) &&
                selectedOrder.statusHistory.length > 0 && (
                  <div className="bg-[#0f1115] border border-gray-800 rounded-2xl p-4">
                    <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider mb-4">
                      Order Status History
                    </h3>

                    <div className="space-y-3">
                      {selectedOrder.statusHistory.map((history, index) => (
                        <div
                          key={history?._id || index}
                          className="flex items-center justify-between gap-3 border-b border-gray-800 last:border-0 pb-3 last:pb-0"
                        >
                          <div>
                            {getStatusBadge(history?.status || "Pending")}
                          </div>

                          <p className="text-[10px] text-gray-500">
                            {formatDate(history?.changedAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* STATUS UPDATE */}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f1115] border border-gray-800 rounded-2xl p-4">
                <div>
                  <p className="text-xs font-bold text-gray-300">
                    Order Status
                  </p>

                  <p className="text-[10px] text-gray-500 mt-1">
                    Update the current order status
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {updatingOrderId === selectedOrder?._id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500" />
                  )}

                  <select
                    value={selectedOrder?.orderStatus || "Pending"}
                    disabled={updatingOrderId === selectedOrder?._id}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder?._id, e.target.value)
                    }
                    className="bg-[#161920] border border-purple-500/50 text-purple-300 font-bold px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-400 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* MODAL ACTIONS */}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => downloadOrderPDF(selectedOrder)}
                  disabled={pdfOrderId === selectedOrder?._id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/20"
                >
                  {pdfOrderId === selectedOrder?._id ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <HiDownload size={17} />
                      Download Order PDF
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="sm:w-32 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition"
                >
                  Close
                </button>
              </div>

              <p className="text-center text-[10px] text-gray-600">
                Click outside the popup or press ESC to close.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

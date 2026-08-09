import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { getImageUrl } from "../services/api";
import toast from "react-hot-toast";

import {
  HiTrash,
  HiShoppingBag,
  HiPlus,
  HiMinus,
  HiLocationMarker,
} from "react-icons/hi";

import { useCart } from "../context/CartContext";

export default function Cart() {
  const navigate = useNavigate();

  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [deliveryArea, setDeliveryArea] = useState("");

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // =========================
  // Load User Information
  // =========================
  useEffect(() => {
    window.scrollTo(0, 0);

    const storedUser = localStorage.getItem("userInfo");

    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser);

      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.address) setAddress(user.address);
    } catch (error) {
      console.error("User info parse error:", error);
    }
  }, []);

  // =========================
  // Quantity Change
  // =========================
  const handleQuantityChange = (cartId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;

    if (newQty <= 0) return;

    if (maxStock && newQty > maxStock) {
      toast.error(`Only ${maxStock} items available`);
      return;
    }

    updateQuantity(cartId, newQty);
  };

  // =========================
  // Cart Calculations
  // =========================
  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const deliveryCharge =
    deliveryArea === "inside" ? 70 : deliveryArea === "outside" ? 100 : 0;

  const totalAmount = subtotal + deliveryCharge;

  // =========================
  // Place Order
  // =========================
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!name || !email || !phone || !address) {
      toast.error("Please fill in all delivery details!");
      return;
    }

    if (!deliveryArea) {
      toast.error("Please select delivery area!");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // let userInfo = null;

    // try {
    //   const storedUser = localStorage.getItem("userInfo");

    //   if (storedUser) {
    //     userInfo = JSON.parse(storedUser);
    //   }
    // } catch (error) {
    //   console.error("User info error:", error);
    // }

    // if (!userInfo?.token) {
    //   toast.error("Please login first to place an order!");

    //   navigate("/login");
    //   return;
    // }

    // =========================
    // Order Data
    // =========================
    const orderData = {
      customerName: name,

      // ⭐ Customer Email
      email: email,

      phone,
      shippingAddress: address,

      // Delivery information
      deliveryArea:
        deliveryArea === "inside" ? "Inside Dhaka" : "Outside Dhaka",

      shippingFee: deliveryCharge,

      // Products
      orderItems: cart.map((item) => ({
        product: item.productId,
        name: item.name,
        image: item.image,
        price: Number(item.price),
        quantity: Number(item.quantity),
        size: item.size || "N/A",
        color: item.color || "N/A",
      })),

      subtotal,

      totalAmount,

      // Payment
      paymentMethod: "Cash on Delivery",

      senderNumber: "",
      transactionId: "",
    };

    try {
      setLoading(true);

      const response = await API.post("/orders", orderData);

      if (response.data?.success) {
        toast.success("Order placed successfully!");

        setOrderSuccess(true);

        clearCart();
      } else {
        toast.error(response.data?.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Order placement error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Success Screen
  // =========================
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#161920] border border-gray-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <span className="text-emerald-400 text-2xl">✓</span>
          </div>

          <h2 className="text-2xl font-black text-white mb-2">
            Order Placed Successfully!
          </h2>

          <p className="text-xs text-gray-400 leading-relaxed mb-6">
            Thank you for your purchase. We have received your order and will
            contact you soon for confirmation.
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* =========================
            Header
        ========================== */}
        <div className="flex flex-col gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-fit text-xs font-bold text-gray-400 hover:text-white transition"
          >
            ← Back
          </button>

          <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <HiShoppingBag className="text-purple-400" />
            Shopping Cart ({cart.length})
          </h1>
        </div>

        {/* =========================
            Empty Cart
        ========================== */}
        {cart.length === 0 ? (
          <div className="bg-[#161920] border border-gray-800 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
              <HiShoppingBag size={28} className="text-purple-400" />
            </div>

            <p className="text-sm text-gray-400 mb-5">
              Your cart is currently empty.
            </p>

            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* =========================
                Cart Products
            ========================== */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-[#161920] border border-gray-800/80 p-4 sm:p-5 rounded-2xl shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Product */}
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-gray-900 border border-gray-800 shrink-0"
                      />

                      <div className="min-w-0 space-y-1.5">
                        <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2">
                          {item.name}
                        </h3>

                        <p className="text-xs text-purple-400 font-bold">
                          ৳{item.price}
                        </p>

                        <div className="flex flex-wrap gap-3 text-[11px] text-gray-400">
                          {item.size && item.size !== "N/A" && (
                            <span>
                              Size:{" "}
                              <strong className="text-gray-200">
                                {item.size}
                              </strong>
                            </span>
                          )}

                          {item.color && item.color !== "N/A" && (
                            <span>
                              Color:{" "}
                              <strong className="text-gray-200">
                                {item.color}
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity + Remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <div className="flex items-center bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item.cartId,
                              item.quantity,
                              -1,
                              item.stock,
                            )
                          }
                          className="px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        >
                          <HiMinus size={12} />
                        </button>

                        <span className="px-3 text-xs font-bold text-white">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item.cartId,
                              item.quantity,
                              1,
                              item.stock,
                            )
                          }
                          className="px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        >
                          <HiPlus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartId)}
                        className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition"
                        title="Remove item"
                      >
                        <HiTrash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* =========================
                Order Summary
            ========================== */}
            <div className="bg-[#161920] border border-gray-800/80 rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left - Summary */}
                <div>
                  <h2 className="text-base font-black text-white pb-3 border-b border-gray-800">
                    Order Summary
                  </h2>

                  <div className="space-y-3 mt-5 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>

                      <span className="text-white font-bold">৳{subtotal}</span>
                    </div>

                    <div className="flex justify-between text-gray-400">
                      <span>Delivery Charge</span>

                      <span className="text-white font-bold">
                        {deliveryCharge > 0
                          ? `৳${deliveryCharge}`
                          : "Select area"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-800">
                      <span className="text-sm font-black text-white">
                        Total
                      </span>

                      <span className="text-xl font-black text-purple-400">
                        ৳{totalAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right - Shipping */}
                <div>
                  <h2 className="text-base font-black text-white pb-3 border-b border-gray-800">
                    Shipping Details
                  </h2>

                  <form onSubmit={handlePlaceOrder} className="space-y-4 mt-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400">
                        Full Name
                      </label>

                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-[#0f1115] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    {/* ⭐ Email */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400">
                        Email Address
                      </label>

                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[#0f1115] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full bg-[#0f1115] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400">
                        Delivery Address
                      </label>

                      <textarea
                        rows="2"
                        placeholder="House, Area, City"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="w-full bg-[#0f1115] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none transition"
                      />
                    </div>

                    {/* Delivery Area */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <HiLocationMarker className="text-purple-400" />
                        Delivery Area
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Inside Dhaka */}
                        <button
                          type="button"
                          onClick={() => setDeliveryArea("inside")}
                          className={`text-left p-3 rounded-xl border transition ${
                            deliveryArea === "inside"
                              ? "bg-purple-600/15 border-purple-500 text-white"
                              : "bg-[#0f1115] border-gray-800 text-gray-400 hover:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">
                              Inside Dhaka
                            </span>

                            <span className="text-xs font-black text-purple-400">
                              ৳70
                            </span>
                          </div>

                          <p className="text-[10px] text-gray-500 mt-1">
                            Dhaka city delivery
                          </p>
                        </button>

                        {/* Outside Dhaka */}
                        <button
                          type="button"
                          onClick={() => setDeliveryArea("outside")}
                          className={`text-left p-3 rounded-xl border transition ${
                            deliveryArea === "outside"
                              ? "bg-purple-600/15 border-purple-500 text-white"
                              : "bg-[#0f1115] border-gray-800 text-gray-400 hover:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">
                              Outside Dhaka
                            </span>

                            <span className="text-xs font-black text-purple-400">
                              ৳100
                            </span>
                          </div>

                          <p className="text-[10px] text-gray-500 mt-1">
                            Outside Dhaka delivery
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="p-3.5 bg-[#0f1115] border border-gray-800 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-gray-500">
                            Payment Method
                          </p>

                          <p className="text-xs font-bold text-white mt-1">
                            Cash on Delivery
                          </p>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                          COD
                        </span>
                      </div>
                    </div>

                    {/* Place Order */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-600/20 transition"
                    >
                      {loading
                        ? "Processing Order..."
                        : `Place Order • ৳${totalAmount}`}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// File Path: src/layouts/Layout.jsx

import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { HiShoppingBag, HiClipboardList, HiMenu, HiX } from "react-icons/hi";

import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell";

// ======================================================
// DESIGN CATEGORIES
// ======================================================

const categories = [ 
  { name: "Drop Shoulder", slug: "chainsaw-man", }, 
  { name: "Regular Fit", slug: "spider-man", }, 
  { name: "Stranger Things", slug: "stranger-things", }, 
  { name: "Essentials", slug: "essentials", }, ];
// ======================================================
// LAYOUT
// ======================================================

export default function Layout() {
  const [userInfo, setUserInfo] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const { cart } = useCart();

  // Cart total quantity
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // ====================================================
  // LOAD USER
  // ====================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");

    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch (error) {
        setUserInfo(null);
      }
    }
  }, []);

  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = () => {
    localStorage.removeItem("userInfo");

    setUserInfo(null);
    setIsMobileMenuOpen(false);

    navigate("/login");
  };

  // ====================================================
  // CATEGORY URL
  // ====================================================

  const getCategoryPath = (slug) => {
    return `/shop/${slug}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ==================================================
          ANNOUNCEMENT BAR
      ================================================== */}

      <div className="bg-gray-900 text-white text-xs sm:text-sm py-2 px-4 text-center tracking-wider">
        🎉 Free Shipping on all orders over ৳2,000! | Hotline: +880 1234 567890
      </div>

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-20 items-center">
          {/* ==================================================
              LOGO
          ================================================== */}

          <Link
            to="/"
            className="flex items-center text-2xl font-black tracking-wider py-2"
          >
            <style>{`
              @keyframes smoothLetterFlow {
                0%, 15% {
                  opacity: 0;
                  transform: translateY(8px) scale(0.9);
                }

                35%, 65% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }

                85%, 100% {
                  opacity: 0;
                  transform: translateY(-8px) scale(0.9);
                }
              }

              .animate-letter-flow {
                display: inline-block;
                animation: smoothLetterFlow 4s ease-in-out infinite;
              }
            `}</style>

            <div className="flex items-center">
              {["I", "N", "F", "Y"].map((char, index) => (
                <span
                  key={`infy-${index}`}
                  className="text-gray-900 animate-letter-flow"
                  style={{
                    animationDelay: `${index * 0.12}s`,
                  }}
                >
                  {char}
                </span>
              ))}

              {["N", "E", "S", "T"].map((char, index) => (
                <span
                  key={`nest-${index}`}
                  className="text-indigo-600 animate-letter-flow"
                  style={{
                    animationDelay: `${(index + 4) * 0.12}s`,
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
          </Link>

          {/* ==================================================
              DESKTOP MENU
          ================================================== */}

          <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-gray-800">
            {/* HOME */}

            <Link
              to="/"
              className="relative py-2 group transition-colors duration-300 hover:text-indigo-600"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* SHOP */}

            <Link
              to="/shop"
              className="relative py-2 group transition-colors duration-300 hover:text-indigo-600"
            >
              Shop
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* DESIGN CATEGORIES */}

            <div className="relative group">
              <button className="relative py-2 transition-colors duration-300 group-hover:text-indigo-600">
                Designs
              </button>

              {/* Dropdown */}

              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                <div className="w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      to={getCategoryPath(category.slug)}
                      className="block px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ADMIN */}

            {userInfo && userInfo.role === "admin" && (
              <Link
                to="/admin/dashboard"
                className="text-xs font-bold bg-black text-white px-3.5 py-2 rounded-xl hover:bg-gray-800 transition shadow-sm"
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* CART */}

            <Link
              to="/cart"
              className="relative p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition flex items-center justify-center text-gray-800"
            >
              <HiShoppingBag size={20} className="text-gray-700" />

              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* MY ORDERS */}

            <div className="hidden sm:flex items-center">
              <Link
                to="/orders"
                className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-indigo-600 transition bg-gray-100 px-3 py-2 rounded-xl"
              >
                <HiClipboardList size={16} className="text-indigo-600" />

                <span>My Orders</span>
              </Link>
            </div>

            {/* NOTIFICATION */}

            <NotificationBell />

            {/* USER */}

            <div className="hidden md:flex items-center space-x-3">
              {userInfo ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-gray-800">
                    Hi, {userInfo.name}
                  </span>

                  <button
                    onClick={handleLogout}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition focus:outline-none"
            >
              {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* ==================================================
            MOBILE MENU
        ================================================== */}

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-6 space-y-4 shadow-xl">
            <div className="flex flex-col space-y-2 font-medium text-gray-800">
              {/* HOME */}

              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-gray-100 transition"
              >
                Home
              </Link>

              {/* SHOP */}

              <Link
                to="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-gray-100 transition"
              >
                Shop
              </Link>

              {/* DESIGN CATEGORIES */}

              <div className="pt-2">
                <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Designs
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      to={getCategoryPath(category.slug)}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition text-sm"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* MY ORDERS */}

              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 transition text-gray-800"
              >
                <HiClipboardList size={18} className="text-indigo-600" />

                <span>My Orders</span>
              </Link>

              {/* ADMIN */}

              {userInfo && userInfo.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-bold bg-black text-white px-3.5 py-2.5 rounded-xl text-center hover:bg-gray-800 transition shadow-sm"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* MOBILE AUTH */}

            <div className="pt-1">
              {userInfo ? (
                <div className="flex flex-col space-y-3">
                  <span className="text-sm font-semibold text-gray-800 px-1">
                    Hi, {userInfo.name}
                  </span>

                  <button
                    onClick={handleLogout}
                    className="w-full text-center rounded-lg bg-red-600 py-2.5 text-xs font-medium text-white hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="bg-gray-900 text-white pt-12 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold tracking-wider mb-4">
              INFY
              <span className="text-indigo-500">NEST</span>
            </h3>

            <p className="text-gray-400 text-sm">
              Your ultimate destination for premium fashion and lifestyle
              trends.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Quick Links</h4>

            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/shop" className="hover:text-white">
                  Shop Collection
                </Link>
              </li>

              <li>
                <Link to="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>

              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Customer Care</h4>

            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#faq" className="hover:text-white">
                  FAQ
                </a>
              </li>

              <li>
                <a href="#shipping" className="hover:text-white">
                  Shipping & Returns
                </a>
              </li>

              <li>
                <a href="#privacy" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Stay Connected</h4>

            <p className="text-gray-400 text-sm mb-3">
              Subscribe to get special offers and once-in-a-lifetime deals.
            </p>

            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm text-gray-900 rounded-l-md focus:outline-none"
              />

              <button className="bg-indigo-600 px-4 py-2 text-sm font-medium rounded-r-md hover:bg-indigo-700">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} INFYNEST. All rights reserved. Designed
          for fashion lovers.
        </div>
      </footer>
    </div>
  );
}

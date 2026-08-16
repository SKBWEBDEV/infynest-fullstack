// File Path: src/layouts/Layout.jsx

import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  HiShoppingBag,
  HiClipboardList,
  HiMenu,
  HiX,
} from "react-icons/hi";

import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell";

import FloatingSupport from "../components/FloatingSupport";

import logo from "../assets/inf.png";

// ======================================================
// LAYOUT
// ======================================================

export default function Layout() {
  const [userInfo, setUserInfo] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const { cart } = useCart();

  // ====================================================
  // CART TOTAL QUANTITY
  // ====================================================

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // ====================================================
  // LOAD USER
  // ====================================================

useEffect(() => {
  const loadUser = () => {
    const storedUser = localStorage.getItem("userInfo");

    if (!storedUser) {
      setUserInfo(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setUserInfo(parsedUser);
    } catch (error) {
      console.error("Failed to parse user info:", error);
      setUserInfo(null);
    }
  };

  // Load user when Layout mounts
  loadUser();

  // Listen for login/logout changes
  window.addEventListener("authChanged", loadUser);

  return () => {
    window.removeEventListener("authChanged", loadUser);
  };
}, []);

  // ====================================================
  // LOGOUT
  // ====================================================
const handleLogout = () => {
  localStorage.removeItem("userInfo");
  localStorage.removeItem("token");

  setUserInfo(null);

  window.dispatchEvent(new Event("authChanged"));

  setIsMobileMenuOpen(false);

  navigate("/");
};

  // ====================================================
  // RETURN
  // ====================================================

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ==================================================
          ANNOUNCEMENT BAR
      ================================================== */}

      <div className="bg-gray-900 text-white overflow-hidden py-2">
        <div className="flex w-max animate-marquee">

          <div className="flex shrink-0">
            <span className="mx-8 text-xs sm:text-sm font-medium tracking-wide">
              🎉 Free Shipping on all orders over ৳2,000! | Hotline: +880 19724-20170
            </span>

            <span className="mx-8 text-xs sm:text-sm font-medium tracking-wide">
              🎉 Free Shipping on all orders over ৳2,000! | Hotline: +880 19724-20170
            </span>

            <span className="mx-8 text-xs sm:text-sm font-medium tracking-wide">
              🎉 Free Shipping on all orders over ৳2,000! | Hotline: +880 19724-20170
            </span>
          </div>

          <div className="flex shrink-0">
            <span className="mx-8 text-xs sm:text-sm font-medium tracking-wide">
              🎉 Free Shipping on all orders over ৳2,000! | Hotline: +880 19724-20170
            </span>

            <span className="mx-8 text-xs sm:text-sm font-medium tracking-wide">
              🎉 Free Shipping on all orders over ৳2,000! | Hotline: +880 19724-20170
            </span>

            <span className="mx-8 text-xs sm:text-sm font-medium tracking-wide">
              🎉 Free Shipping on all orders over ৳2,000! | Hotline: +880 19724-20170
            </span>
          </div>

        </div>

        <style>{`
          @keyframes marquee {
            from {
              transform: translateX(0);
            }

            to {
              transform: translateX(-50%);
            }
          }

          .animate-marquee {
            animation: marquee 18s linear infinite;
          }
        `}</style>
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
            className="
              group
              flex
              items-center
              py-2
              select-none
              shrink-0
            "
          >
            <img
              src={logo}
              alt="INFYNEST"
              className="
                h-9
                sm:h-5
                md:h-11
                lg:h-15
                w-auto
                max-w-[170px]
                sm:max-w-[190px]
                md:max-w-[210px]
                object-contain
                transition-all
                duration-300
                ease-out
                group-hover:scale-105
              "
            />
          </Link>

          {/* ==================================================
              DESKTOP MENU
          ================================================== */}

          <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-gray-800">

            {/* HOME */}

            <Link
              to="/"
              className="
                relative
                py-2
                group
                transition-colors
                duration-300
                hover:text-indigo-600
              "
            >
              Home

              <span
                className="
                  absolute
                  bottom-0
                  left-0
                  w-0
                  h-[2px]
                  bg-indigo-600
                  transition-all
                  duration-300
                  group-hover:w-full
                "
              />
            </Link>

            {/* SHOP */}

            <Link
              to="/shop"
              className="
                relative
                py-2
                group
                transition-colors
                duration-300
                hover:text-indigo-600
              "
            >
              Shop

              <span
                className="
                  absolute
                  bottom-0
                  left-0
                  w-0
                  h-[2px]
                  bg-indigo-600
                  transition-all
                  duration-300
                  group-hover:w-full
                "
              />
            </Link>

            {/* ADMIN */}

            {userInfo && userInfo.role === "admin" && (
              <Link
                to="/admin/dashboard"
                className="
                  text-xs
                  font-bold
                  bg-black
                  text-white
                  px-3.5
                  py-2
                  rounded-xl
                  hover:bg-gray-800
                  transition
                  shadow-sm
                "
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <div className="flex items-center space-x-3 sm:space-x-4">

            {/* ==================================================
                CART
            ================================================== */}

            <Link
              to="/cart"
              className="
                relative
                p-2.5
                bg-gray-100
                hover:bg-gray-200
                rounded-full
                transition
                flex
                items-center
                justify-center
                text-gray-800
              "
            >
              <HiShoppingBag
                size={20}
                className="text-gray-700"
              />

              {totalItems > 0 && (
                <span
                  className="
                    absolute
                    -top-1
                    -right-1
                    bg-indigo-600
                    text-white
                    text-[11px]
                    font-extrabold
                    w-5
                    h-5
                    rounded-full
                    flex
                    items-center
                    justify-center
                    shadow-md
                  "
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {/* ==================================================
                MY ORDERS
            ================================================== */}

            <div className="hidden sm:flex items-center">
              <Link
                to="/orders"
                className="
                  flex
                  items-center
                  gap-1.5
                  text-xs
                  font-bold
                  text-gray-700
                  hover:text-indigo-600
                  transition
                  bg-gray-100
                  px-3
                  py-2
                  rounded-xl
                "
              >
                <HiClipboardList
                  size={16}
                  className="text-indigo-600"
                />

                <span>My Orders</span>
              </Link>
            </div>

            {/* ==================================================
                NOTIFICATION
            ================================================== */}

            <NotificationBell />

            {/* ==================================================
                USER
            ================================================== */}

            <div className="hidden md:flex items-center space-x-3">

              {userInfo ? (
                <div className="flex items-center space-x-3">

                  <span className="text-sm font-semibold text-gray-800">Hi, {userInfo?.name || userInfo?.fullName || "User"}</span>

                  <button
                    onClick={handleLogout}
                    className="
                      rounded-md
                      bg-red-600
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-white
                      hover:bg-red-700
                      transition
                      cursor-pointer
                    "
                  >
                    Logout
                  </button>

                </div>
              ) : (
                <div className="space-x-3">

                  <Link
                    to="/login"
                    className="
                      text-sm
                      font-medium
                      text-gray-700
                      hover:text-indigo-600
                      transition
                    "
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="
                      rounded-md
                      bg-indigo-600
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-white
                      hover:bg-indigo-700
                      transition
                    "
                  >
                    Register
                  </Link>

                </div>
              )}

            </div>

            {/* ==================================================
                MOBILE MENU BUTTON
            ================================================== */}

            <button
              onClick={() =>
                setIsMobileMenuOpen((prev) => !prev)
              }
              className="
                md:hidden
                p-2
                rounded-lg
                text-gray-700
                hover:bg-gray-100
                transition
                focus:outline-none
              "
            >
              {isMobileMenuOpen ? (
                <HiX size={24} />
              ) : (
                <HiMenu size={24} />
              )}
            </button>

          </div>
        </div>

        {/* ==================================================
            MOBILE MENU
        ================================================== */}

        {isMobileMenuOpen && (
          <div
            className="
              md:hidden
              bg-white
              border-t
              border-gray-100
              px-4
              pt-3
              pb-6
              space-y-4
              shadow-xl
            "
          >

            <div className="flex flex-col space-y-2 font-medium text-gray-800">

              {/* HOME */}

              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="
                  py-2
                  px-3
                  rounded-lg
                  hover:bg-gray-100
                  transition
                "
              >
                Home
              </Link>

              {/* SHOP */}

              <Link
                to="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="
                  py-2
                  px-3
                  rounded-lg
                  hover:bg-gray-100
                  transition
                "
              >
                Shop
              </Link>

              {/* MY ORDERS */}

              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="
                  flex
                  items-center
                  gap-2
                  py-2
                  px-3
                  rounded-lg
                  hover:bg-gray-100
                  transition
                  text-gray-800
                "
              >
                <HiClipboardList
                  size={18}
                  className="text-indigo-600"
                />

                <span>My Orders</span>
              </Link>

              {/* ADMIN */}

              {userInfo && userInfo.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="
                    text-xs
                    font-bold
                    bg-black
                    text-white
                    px-3.5
                    py-2.5
                    rounded-xl
                    text-center
                    hover:bg-gray-800
                    transition
                    shadow-sm
                  "
                >
                  Admin Dashboard
                </Link>
              )}

            </div>

            <hr className="border-gray-200" />

            {/* ==================================================
                MOBILE AUTH
            ================================================== */}

            <div className="pt-1">

              {userInfo ? (
                <div className="flex flex-col space-y-3">

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-gray-800
                      px-1
                    "
                  >
                    Hi, {userInfo.name}
                  </span>

                  <button
                    onClick={handleLogout}
                    className="
                      w-full
                      text-center
                      rounded-lg
                      bg-red-600
                      py-2.5
                      text-xs
                      font-medium
                      text-white
                      hover:bg-red-700
                      transition
                    "
                  >
                    Logout
                  </button>

                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">

                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="
                      text-center
                      rounded-lg
                      border
                      border-gray-300
                      py-2.5
                      text-sm
                      font-medium
                      text-gray-700
                      hover:bg-gray-100
                      transition
                    "
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="
                      text-center
                      rounded-lg
                      bg-indigo-600
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      hover:bg-indigo-700
                      transition
                    "
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

        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            grid
            grid-cols-1
            md:grid-cols-4
            gap-8
            mb-8
          "
        >

          {/* BRAND */}

          <div>
            <h3 className="text-xl font-bold tracking-wider mb-4 text-white">
              INFYNEST
            </h3>

            <p className="text-gray-400 text-sm">
              Your ultimate destination for premium fashion and lifestyle
              trends.
            </p>
          </div>

          {/* QUICK LINKS */}

          <div>
            <h4 className="font-semibold mb-4 text-gray-200">
              Quick Links
            </h4>

            <ul className="space-y-2 text-sm text-gray-400">

              <li>
                <Link
                  to="/"
                  className="hover:text-white"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/shop"
                  className="hover:text-white"
                >
                  Shop Collection
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="hover:text-white"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="hover:text-white"
                >
                  Contact
                </Link>
              </li>

            </ul>
          </div>

          {/* CUSTOMER CARE */}

          <div>
            <h4 className="font-semibold mb-4 text-gray-200">
              Customer Care
            </h4>

            <ul className="space-y-2 text-sm text-gray-400">

              <li>
                <Link
                  to="/faq"
                  className="hover:text-white"
                >
                  FAQ
                </Link>
              </li>

              <li>
                <Link
                  to="/shipping-returns"
                  className="hover:text-white"
                >
                  Shipping & Returns
                </Link>
              </li>

              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>

            </ul>
          </div>

          {/* SUBSCRIBE */}

          <div>
            <h4 className="font-semibold mb-4 text-gray-200">
              Stay Connected
            </h4>

            <p className="text-gray-400 text-sm mb-3">
              Subscribe to get special offers and once-in-a-lifetime deals.
            </p>

            <div className="flex">

              <input
                type="email"
                placeholder="Enter your email"
                className="
                  w-full
                  px-3
                  py-2
                  text-sm
                  text-gray-900
                  rounded-l-md
                  focus:outline-none
                "
              />

              <button
                className="
                  bg-indigo-600
                  px-4
                  py-2
                  text-sm
                  font-medium
                  rounded-r-md
                  hover:bg-indigo-700
                "
              >
                Subscribe
              </button>

            </div>
          </div>

        </div>

        {/* COPYRIGHT */}

        <div
          className="
            border-t
            border-gray-800
            pt-6
            text-center
            text-sm
            text-gray-500
          "
        >
          © {new Date().getFullYear()} INFYNEST. All rights reserved.
          Designed for fashion lovers.
        </div>

      </footer>

      {/* ==========================================
        FLOATING CUSTOMER SUPPORT
    ========================================== */}

    <FloatingSupport />

    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../services/api";
import toast from "react-hot-toast";

import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

import { HiArrowLeft, HiArrowRight, HiEye, HiEyeOff } from "react-icons/hi";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [secretCode, setSecretCode] = useState("");

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // ==========================================
  // SLIDER IMAGES
  // ==========================================

  const sliderImages = [
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1920&auto=format&fit=crop",

    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop",

    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1920&auto=format&fit=crop",
  ];

  // ==========================================
  // AUTO SLIDE
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        return (prevIndex + 1) % sliderImages.length;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  // ==========================================
  // MANUAL SLIDE
  // ==========================================

  const nextSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + sliderImages.length) % sliderImages.length,
    );
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await API.post("/auth/register", {
        name,
        email,
        password,
        secretCode,
      });

      if (res.status === 201) {
        setLoading(false);

        setShowPopup(true);

        setName("");
        setEmail("");
        setPassword("");
        setSecretCode("");
      }
    } catch (error) {
      setLoading(false);

      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  // ==========================================
  // CLOSE EMAIL POPUP
  // ==========================================

  const handleClosePopup = () => {
    setShowPopup(false);
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('/box.png')",
      }}
    >
      <div className="w-full max-w-6xl bg-white rounded-[32px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">
        {/* =====================================================
            LEFT SIDE - AUTO IMAGE SLIDER
        ====================================================== */}

<div
  className="relative rounded-[28px] overflow-hidden p-6 md:p-8 flex flex-col justify-between text-white bg-cover bg-center mt-3.5
  bottom-2 left-2.5 sm:right-2.5 h-[480px] lg:h-[640px] transition-all duration-500 border border-white/40"
  style={{
    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.7)), url('${sliderImages[currentImageIndex]}')`,
  }}>
          {/* Top Content */}

          <div className="flex justify-between items-start">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-semibold tracking-wider">
                INFYNEST
              </span>

              <p className="text-xs text-gray-200 mt-3">
                Fashion • Lifestyle • E-commerce
              </p>
            </div>

            {/* Slide Counter */}

            <div className="px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-[10px] font-semibold">
              {String(currentImageIndex + 1).padStart(2, "0")} /{" "}
              {String(sliderImages.length).padStart(2, "0")}
            </div>
          </div>

          {/* Center Content */}

          <div className="flex-1 flex items-center">
            <div className="max-w-md">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-300 mb-3">
                Discover Your Style
              </p>

              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Style that
                <br />
                <span className="text-indigo-400">speaks for you.</span>
              </h2>

              <p className="mt-4 text-sm text-gray-200 leading-relaxed max-w-sm">
                Discover premium fashion and lifestyle products designed to make
                every moment feel special.
              </p>
            </div>
          </div>

          {/* Bottom Content */}

          <div className="flex justify-between items-end">
            {/* Brand */}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
                IN
              </div>

              <div>
                <h4 className="font-bold text-sm">INFYNEST.ui</h4>

                <p className="text-[11px] text-gray-300">
                  UI & E-commerce Platform
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={prevSlide}
                className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition text-white cursor-pointer backdrop-blur-sm"
              >
                <HiArrowLeft size={15} />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition text-white cursor-pointer backdrop-blur-sm"
              >
                <HiArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Slider Indicators */}

          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sliderImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentImageIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "w-7 bg-white"
                    : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE - REGISTER FORM
        ====================================================== */}

        <div className="px-5 sm:px-8 md:px-10 py-8 flex flex-col justify-center bg-white">
          {/* Header */}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-lg font-black text-black tracking-wider">
              INFYNEST
            </h1>

            {/* Language Switcher */}

            <div className="flex items-center gap-1 border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-50">
              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={
                  i18n.language === "en"
                    ? "font-bold text-black"
                    : "text-gray-500"
                }
              >
                EN
              </button>

              <span>|</span>

              <button
                type="button"
                onClick={() => changeLanguage("bn")}
                className={
                  i18n.language === "bn"
                    ? "font-bold text-black"
                    : "text-gray-500"
                }
              >
                BN
              </button>
            </div>
          </div>

          {/* Title */}

          <div className="mb-5">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              {t("create_account")}
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {t("welcome_platform")}
            </p>
          </div>

          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}

            <div>
              <input
                type="text"
                placeholder={t("full_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-gray-50/50 text-gray-800 placeholder-gray-400 transition"
              />
            </div>

            {/* Email */}

            <div>
              <input
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-gray-50/50 text-gray-800 placeholder-gray-400 transition"
              />
            </div>

            {/* Password */}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-gray-50/50 text-gray-800 placeholder-gray-400 transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? <HiEyeOff size={16} /> : <HiEye size={16} />}
              </button>
            </div>

            {/* Admin Secret Code */}

            <div>
              <input
                type="text"
                placeholder="Admin Secret Code (Leave blank if normal user)"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-dashed border-orange-400 text-xs bg-orange-50/30 focus:outline-none focus:border-orange-600 placeholder-gray-400 transition"
              />
            </div>

            {/* Divider */}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200" />

              <span className="flex-shrink mx-4 text-gray-400 text-xs">
                {t("or")}
              </span>

              <div className="flex-grow border-t border-gray-200" />
            </div>

            {/* Google */}

            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const res = await API.post("/auth/google-login", {
                      token: credentialResponse.credential,
                    });

                    console.log("Register Success:", res.data);

                    localStorage.setItem("token", res.data.token);

                    localStorage.setItem("userInfo", JSON.stringify(res.data));

                    navigate("/");
                  } catch (error) {
                    console.error("Google register failed", error);

                    toast.error(
                      error.response?.data?.message ||
                        "Google registration failed",
                    );
                  }
                }}
                onError={() => {
                  toast.error("Google registration failed");
                }}
              />
            </div>

            {/* Register Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#f53b3b] hover:bg-[#e03131] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold transition text-xs shadow-md shadow-red-500/20 cursor-pointer"
            >
              {loading ? "Processing..." : t("create_account")}
            </button>
          </form>

          {/* Login */}

          <div className="mt-5 text-center">
            <p className="text-xs text-gray-500">
              {t("already_have_account")}{" "}
              <Link
                to="/login"
                className="text-[#f53b3b] font-semibold hover:underline"
              >
                {t("log_in")}
              </Link>
            </p>

            {/* Social */}

            <div className="flex justify-center items-center gap-6 mt-5 text-gray-400">
              <a href="#" className="hover:text-black transition">
                <FaFacebookF size={14} />
              </a>

              <a href="#" className="hover:text-black transition">
                <FaTwitter size={14} />
              </a>

              <a href="#" className="hover:text-black transition">
                <FaLinkedinIn size={14} />
              </a>

              <a href="#" className="hover:text-black transition">
                <FaInstagram size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          EMAIL VERIFICATION POPUP
      ====================================================== */}

      {showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-2xl text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-red-50 text-[#f53b3b] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
              ✉️
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2">
              Verify Your Email!
            </h3>

            <p className="text-gray-500 text-xs leading-relaxed mb-6">
              We have sent a verification link to your email address. Please
              check your inbox and verify your account before logging in.
            </p>

            <button
              onClick={handleClosePopup}
              className="w-full py-3 bg-[#f53b3b] hover:bg-[#e03131] text-white rounded-xl font-bold transition text-xs shadow-md shadow-red-500/20 cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;

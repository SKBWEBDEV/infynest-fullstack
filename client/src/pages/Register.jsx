import React, { useState } from "react";
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
  const [showPopup, setShowPopup] = useState(false); // ইমেল ভেরিফিকেশন পপআপের জন্য স্টেট
  const [loading, setLoading] = useState(false);
  const [secretCode, setSecretCode] = useState("");

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const sliderImages = [
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1920&auto=format&fit=crop",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + sliderImages.length) % sliderImages.length,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ব্যাকএন্ডের রেজিস্ট্রেশন রাউটে রিকোয়েস্ট পাঠানো
      const res = await API.post("/auth/register", {
  name,
  email,
  password,
  secretCode,
});

      if (res.status === 201) {
        setLoading(false);
        setShowPopup(true); // সফল হলে ইমেল ভেরিফিকেশন পপআপ শো করবে
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  // পপআপের বাটন ক্লিক করলে লগইন পেজে নিয়ে যাবে
  const handleClosePopup = () => {
    setShowPopup(false);
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('/box.png')`,
      }}
    >
      <div className="bg-white w-full max-w-5xl rounded-[36px] shadow-2xl p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center relative z-10">
        {/* Left Side: Image Slider Banner */}
        <div
          className="relative rounded-[28px] overflow-hidden p-6 md:p-8 flex flex-col justify-between text-white bg-cover bg-center h-[480px] lg:h-[540px] transition-all duration-500"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.7)), url('${sliderImages[currentImageIndex]}')`,
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium tracking-wider text-gray-200">
              Slide {currentImageIndex + 1} / {sliderImages.length}
            </span>
          </div>

          <div className="flex justify-between items-end">
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

            <div className="flex gap-2">
              <button
                type="button"
                onClick={prevSlide}
                className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition text-white cursor-pointer"
              >
                <HiArrowLeft size={14} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition text-white cursor-pointer"
              >
                <HiArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Form Section */}
        <div className="px-4 md:px-6 py-2 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-black text-black tracking-wider">
              INFYNEST
            </h1>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 border border-gray-200 px-2 py-1 rounded-lg text-xs font-semibold text-gray-700 bg-gray-50 cursor-pointer">
              <span
                onClick={() => changeLanguage("en")}
                className={
                  i18n.language === "en"
                    ? "font-bold text-black"
                    : "text-gray-500"
                }
              >
                EN
              </span>
              <span>|</span>
              <span
                onClick={() => changeLanguage("bn")}
                className={
                  i18n.language === "bn"
                    ? "font-bold text-black"
                    : "text-gray-500"
                }
              >
                BN
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              {t("create_account")}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("welcome_platform")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder={t("full_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black text-xs bg-gray-50/50 text-gray-800 placeholder-gray-400 transition"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black text-xs bg-gray-50/50 text-gray-800 placeholder-gray-400 transition"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:border-black text-xs bg-gray-50/50 text-gray-800 placeholder-gray-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? <HiEyeOff size={16} /> : <HiEye size={16} />}
              </button>
            </div>

            {/* Secret Admin Code Input */}
            <div>
              <input
                type="text"
                placeholder="Admin Secret Code (Leave blank if normal user)"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-dashed border-orange-400 text-xs bg-orange-50/30 focus:outline-none focus:border-orange-600 placeholder-gray-400 transition"
              />
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs">
                {t("or")}
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google Login Real Button */}
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const res = await API.post(
                        "/auth/google-login",
                      {
                        token: credentialResponse.credential,
                      },
                    );
                    console.log("Register Success:", res.data);
                    localStorage.setItem("token", res.data.token);
                    navigate("/");
                  } catch (error) {
                    console.error("Google register failed", error);
                  }
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#f53b3b] hover:bg-[#e03131] text-white rounded-xl font-bold transition text-xs shadow-md shadow-red-500/20 cursor-pointer"
            >
              {loading ? "Processing..." : t("create_account")}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              {t("already_have_account")}{" "}
              <Link
                to="/login"
                className="text-[#f53b3b] font-semibold hover:underline"
              >
                {t("log_in")}
              </Link>
            </p>

            <div className="flex justify-center items-center gap-6 mt-4 text-gray-400">
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

      {/* ইমেল ভেরিফিকেশন পপআপ (মোদাল) */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 md:p-8 rounded-[28px] shadow-2xl text-center max-w-sm w-full transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
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

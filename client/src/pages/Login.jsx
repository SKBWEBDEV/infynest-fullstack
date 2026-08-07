// writing{variant="document" id="58321"}
import { useEffect, useState } from "react";
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

import {
  HiArrowLeft,
  HiArrowRight,
  HiEye,
  HiEyeOff,
} from "react-icons/hi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
  }, []);

  // ==========================================
  // MANUAL SLIDE
  // ==========================================

  const nextSlide = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % sliderImages.length,
    );
  };

  const prevSlide = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + sliderImages.length) % sliderImages.length,
    );
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      // Save complete user information
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Save token separately
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      toast.success("Login Successful!");

      setEmail("");
      setPassword("");

      // Role based redirect
      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed",
      );
    }
  };

  return (
    <div
  className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 sm:p-0 md:p-8 relative overflow-hidden border-0 border-white/20"
  style={{
    backgroundImage:
      "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.65)), url('/box.png')",
  }}
>
      {/* ==========================================
          MAIN CARD
      ========================================== */}

      <div className="bg-white w-full max-w-5xl rounded-[30px] md:rounded-[36px] shadow-2xl p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-center relative z-10">

        {/* ==========================================
            LEFT SIDE - AUTO IMAGE SLIDER
        ========================================== */}

        <div
          className="
            relative
            w-full
            min-h-[430px]
            sm:min-h-[480px]
            lg:min-h-[540px]
            rounded-[24px]
            md:rounded-[28px]
            overflow-hidden
            border border-white/40
            text-white
          "
        >

          {/* Background Image */}

          <div
            key={currentImageIndex}
            className="absolute inset-0 bg-cover bg-center animate-login-fade"
            style={{
              backgroundImage: `
                linear-gradient(
                  to bottom,
                  rgba(0,0,0,0.15),
                  rgba(0,0,0,0.78)
                ),
                url("${sliderImages[currentImageIndex]}")
              `,
            }}
          />

          {/* Slider Content */}

          <div className="relative z-10 min-h-[430px] sm:min-h-[480px] lg:min-h-[540px] p-5 sm:p-6 md:p-8 flex flex-col justify-between">

            {/* Top */}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

              <span className="text-xs font-medium tracking-wider text-gray-200">
                {t("welcome_back")}
              </span>

              <div className="flex items-center gap-2">

                <span className="text-[11px] sm:text-xs text-gray-300">
                  {t("dont_have_account")}
                </span>

                <Link
                  to="/register"
                  className="
                    border border-white/50
                    px-3 sm:px-3.5
                    py-1.5
                    rounded-full
                    text-[11px] sm:text-xs
                    font-medium
                    hover:bg-white
                    hover:text-black
                    transition
                  "
                >
                  {t("register")}
                </Link>

              </div>
            </div>

            {/* Center Content */}

            <div className="flex-1 flex items-center">

              <div className="max-w-md">

                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-semibold tracking-wider mb-4">
                  INFYNEST
                </span>

                <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gray-300 mb-3">
                  Fashion • Lifestyle • E-commerce
                </p>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  Welcome
                  <br />
                  <span className="text-indigo-400">
                    back to INFYNEST.
                  </span>
                </h2>

                <p className="mt-4 text-xs sm:text-sm text-gray-200 leading-relaxed max-w-sm">
                  Discover premium fashion and lifestyle products
                  designed to make every moment feel special.
                </p>

              </div>

            </div>

            {/* Bottom */}

            <div className="flex justify-between items-end gap-3">

              {/* Brand */}

              <div className="flex items-center gap-2 sm:gap-3">

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-md shrink-0">
                  IN
                </div>

                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    INFYNEST.ui
                  </h4>

                  <p className="text-[9px] sm:text-[11px] text-gray-300">
                    UI & E-commerce Platform
                  </p>
                </div>

              </div>

              {/* Navigation */}

              <div className="flex gap-2 shrink-0">

                <button
                  type="button"
                  onClick={prevSlide}
                  className="
                    w-8 h-8 sm:w-9 sm:h-9
                    rounded-full
                    border border-white/40
                    flex items-center justify-center
                    hover:bg-white/20
                    transition
                    text-white
                    cursor-pointer
                    backdrop-blur-sm
                  "
                >
                  <HiArrowLeft size={14} />
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  className="
                    w-8 h-8 sm:w-9 sm:h-9
                    rounded-full
                    border border-white/40
                    flex items-center justify-center
                    hover:bg-white/20
                    transition
                    text-white
                    cursor-pointer
                    backdrop-blur-sm
                  "
                >
                  <HiArrowRight size={14} />
                </button>

              </div>

            </div>

            {/* Slider Indicators */}

            <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 flex gap-1.5">

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
        </div>

        {/* ==========================================
            RIGHT SIDE - LOGIN FORM
        ========================================== */}

        <div className="px-4 sm:px-6 md:px-8 lg:px-6 py-6 md:py-8 flex flex-col justify-center">

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

          <div className="mb-6">

            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              {t("sign_in")}
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {t("welcome_back")}
            </p>

          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Email */}

            <div>

              <input
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  w-full
                  px-4 py-3.5
                  rounded-xl
                  border border-gray-200
                  focus:outline-none
                  focus:border-black
                  focus:ring-2
                  focus:ring-black/5
                  text-xs
                  bg-gray-50/50
                  text-gray-800
                  placeholder-gray-400
                  transition
                "
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
                className="
                  w-full
                  px-4 py-3.5
                  pr-10
                  rounded-xl
                  border border-gray-200
                  focus:outline-none
                  focus:border-black
                  focus:ring-2
                  focus:ring-black/5
                  text-xs
                  bg-gray-50/50
                  text-gray-800
                  placeholder-gray-400
                  transition
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  hover:text-gray-700
                  cursor-pointer
                "
              >
                {showPassword ? (
                  <HiEyeOff size={16} />
                ) : (
                  <HiEye size={16} />
                )}
              </button>

            </div>

            {/* Remember / Forgot */}

            <div className="flex items-center justify-between text-xs gap-3">

              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">

                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#f53b3b] focus:ring-0"
                />

                Remember me

              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </Link>

            </div>

            {/* Divider */}

            <div className="relative flex py-1 items-center">

              <div className="flex-grow border-t border-gray-200" />

              <span className="flex-shrink mx-4 text-gray-400 text-xs">
                {t("or")}
              </span>

              <div className="flex-grow border-t border-gray-200" />

            </div>

            {/* Google Login */}

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

                    console.log(
                      "Google Login Success:",
                      res.data,
                    );

                    localStorage.setItem(
                      "userInfo",
                      JSON.stringify(res.data),
                    );

                    localStorage.setItem(
                      "token",
                      res.data.token,
                    );

                    toast.success("Login Successful!");

                    if (res.data.role === "admin") {
                      navigate("/admin/dashboard");
                    } else {
                      navigate("/");
                    }

                  } catch (error) {

                    console.error(
                      "Google login failed",
                      error,
                    );

                    toast.error(
                      error.response?.data?.message ||
                        "Google login failed",
                    );
                  }
                }}

                onError={() => {
                  toast.error("Google Login Failed");
                }}
              />

            </div>

            {/* Login Button */}

            <button
              type="submit"
              className="
                w-full
                py-3.5
                bg-[#f53b3b]
                hover:bg-[#e03131]
                text-white
                rounded-xl
                font-bold
                transition
                text-xs
                shadow-md
                shadow-red-500/20
                cursor-pointer
              "
            >
              {t("sign_in")}
            </button>

          </form>

          {/* Bottom */}

          <div className="mt-6 text-center">

            <p className="text-xs text-gray-500">

              {t("dont_have_account")}{" "}

              <Link
                to="/register"
                className="text-[#f53b3b] font-semibold hover:underline"
              >
                {t("register")}
              </Link>

            </p>

            {/* Social */}

            <div className="flex justify-center items-center gap-6 mt-5 text-gray-400">

              <a
                href="#"
                className="hover:text-black transition"
              >
                <FaFacebookF size={14} />
              </a>

              <a
                href="#"
                className="hover:text-black transition"
              >
                <FaTwitter size={14} />
              </a>

              <a
                href="#"
                className="hover:text-black transition"
              >
                <FaLinkedinIn size={14} />
              </a>

              <a
                href="#"
                className="hover:text-black transition"
              >
                <FaInstagram size={14} />
              </a>

            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          SLIDER ANIMATION
      ========================================== */}

      <style>
        {`
          @keyframes loginFade {
            from {
              opacity: 0;
              transform: scale(1.03);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-login-fade {
            animation: loginFade 0.8s ease-in-out;
          }
        `}
      </style>

    </div>
  );
};

export default Login;

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
  const [previousImageIndex, setPreviousImageIndex] = useState(0);

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
    const nextIndex =
      (currentImageIndex + 1) % sliderImages.length;

    setPreviousImageIndex(currentImageIndex);
    setCurrentImageIndex(nextIndex);
  }, 3500);

  return () => clearInterval(interval);
}, [currentImageIndex, sliderImages.length]);

  // ==========================================
  // MANUAL SLIDE
  // ==========================================

const nextSlide = () => {
  const nextIndex =
    (currentImageIndex + 1) % sliderImages.length;

  setPreviousImageIndex(currentImageIndex);
  setCurrentImageIndex(nextIndex);
};

const prevSlide = () => {
  const prevIndex =
    (currentImageIndex - 1 + sliderImages.length) %
    sliderImages.length;

  setPreviousImageIndex(currentImageIndex);
  setCurrentImageIndex(prevIndex);
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


        {/* Left Side: Image Slider Banner */}
<div
  className="
    relative
    rounded-[28px]
    overflow-hidden
    p-6 md:p-8
    flex flex-col justify-between
    text-white
    h-[480px]
    lg:h-[540px]
    border border-white/40
  "
>
  {/* Previous Image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: `
        linear-gradient(
          to bottom,
          rgba(0,0,0,0.15),
          rgba(0,0,0,0.7)
        ),
        url('${sliderImages[previousImageIndex]}')
      `,
    }}
  />

  {/* Current Image */}
  <div
    key={currentImageIndex}
    className="absolute inset-0 bg-cover bg-center animate-slider-fade"
    style={{
      backgroundImage: `
        linear-gradient(
          to bottom,
          rgba(0,0,0,0.15),
          rgba(0,0,0,0.7)
        ),
        url('${sliderImages[currentImageIndex]}')
      `,
    }}
  />

  {/* Content */}
  <div className="relative z-10 flex h-full flex-col justify-between">

    {/* Top */}
    <div className="flex justify-between items-center">
      <span className="text-xs font-medium tracking-wider text-gray-200">
        {t("welcome_back")}
      </span>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-300">
          {t("dont_have_account")}
        </span>

        <Link
          to="/register"
          className="
            border border-white/50
            px-3.5 py-1.5
            rounded-full
            text-xs font-medium
            hover:bg-white
            hover:text-black
            transition
          "
        >
          {t("register")}
        </Link>
      </div>
    </div>

    {/* Bottom */}
    <div className="flex justify-between items-end">

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
          IN
        </div>

        <div>
          <h4 className="font-bold text-sm">
            INFYNEST.ui
          </h4>

          <p className="text-[11px] text-gray-300">
            UI & E-commerce Platform
          </p>
        </div>
      </div>

      {/* Arrows */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={prevSlide}
          className="
            w-8 h-8
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
            w-8 h-8
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

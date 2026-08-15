// File Path: src/pages/Register.jsx

import React, { useEffect, useState } from "react";

import {
  useTranslation,
} from "react-i18next";

import {
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

import {
  GoogleLogin,
} from "@react-oauth/google";

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

const Register = () => {

  // ==========================================
  // STATES
  // ==========================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [secretCode, setSecretCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [showPopup, setShowPopup] =
    useState(false);

  // ==========================================
  // SLIDER
  // ==========================================

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);

  const [previousImageIndex, setPreviousImageIndex] =
    useState(0);

  // ==========================================
  // ROUTER
  // ==========================================

  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // TRANSLATION
  // ==========================================

  const { t, i18n } =
    useTranslation();

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
  // RETURN PATH
  // ==========================================

  const getReturnPath = () => {

    const from = location.state?.from;

    if (
      typeof from === "string" &&
      from.startsWith("/")
    ) {
      return from;
    }

    return "/";
  };

  // ==========================================
  // AUTO SLIDER
  // ==========================================

  useEffect(() => {

    const interval = setInterval(() => {

      setPreviousImageIndex(
        currentImageIndex
      );

      setCurrentImageIndex(
        (currentImageIndex + 1) %
        sliderImages.length
      );

    }, 3500);

    return () =>
      clearInterval(interval);

  }, [currentImageIndex]);

  // ==========================================
  // NEXT SLIDE
  // ==========================================

  const nextSlide = () => {

    setPreviousImageIndex(
      currentImageIndex
    );

    setCurrentImageIndex(
      (currentImageIndex + 1) %
      sliderImages.length
    );
  };

  // ==========================================
  // PREVIOUS SLIDE
  // ==========================================

  const prevSlide = () => {

    setPreviousImageIndex(
      currentImageIndex
    );

    setCurrentImageIndex(
      (currentImageIndex - 1 +
        sliderImages.length) %
      sliderImages.length
    );
  };

  // ==========================================
  // NORMAL REGISTER
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading || googleLoading) {
      return;
    }

    // Basic validation

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim();

    if (!cleanName) {
      toast.error(
        "Please enter your full name."
      );

      return;
    }

    if (!cleanEmail) {
      toast.error(
        "Please enter your email."
      );

      return;
    }

    if (!password.trim()) {
      toast.error(
        "Please enter a password."
      );

      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must be at least 6 characters."
      );

      return;
    }

    try {

      setLoading(true);

      const response =
        await API.post(
          "/auth/register",
          {
            name: cleanName,
            email: cleanEmail,
            password,
            secretCode:
              secretCode.trim(),
          }
        );

      console.log(
        "Register Response:",
        response?.data
      );

      // ==========================================
      // SUCCESS
      // ==========================================

      if (
        response?.status === 200 ||
        response?.status === 201
      ) {

        toast.success(
          "Registration successful!"
        );

        // Clear form

        setName("");
        setEmail("");
        setPassword("");
        setSecretCode("");

        // Show verification popup

        setShowPopup(true);

      } else {

        toast.error(
          response?.data?.message ||
          "Registration failed."
        );
      }

    } catch (error) {

      console.error(
        "Registration Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        "Registration failed. Please try again."
      );

    } finally {

      setLoading(false);
    }
  };

  // ==========================================
  // GOOGLE REGISTER / LOGIN
  // ==========================================

  const handleGoogleSuccess =
    async (credentialResponse) => {

      if (
        loading ||
        googleLoading
      ) {
        return;
      }

      if (
        !credentialResponse?.credential
      ) {

        toast.error(
          "Google authentication failed."
        );

        return;
      }

      try {

        setGoogleLoading(true);

        const response =
          await API.post(
            "/auth/google-login",
            {
              token:
                credentialResponse.credential,
            }
          );

        const data =
          response?.data;

        console.log(
          "Google Register Response:",
          data
        );

        if (!data) {
          throw new Error(
            "Invalid Google response."
          );
        }

        // ==========================================
        // SAVE USER
        // ==========================================

        if (data?.token) {

          localStorage.setItem(
            "token",
            data.token
          );
        }

        localStorage.setItem(
          "userInfo",
          JSON.stringify(data)
        );

        toast.success(
          "Google registration successful!"
        );

        // ==========================================
        // ROLE REDIRECT
        // ==========================================

        if (
          data?.role === "admin"
        ) {

          navigate(
            "/admin/dashboard",
            {
              replace: true,
            }
          );

        } else {

          navigate(
            getReturnPath(),
            {
              replace: true,
            }
          );
        }

      } catch (error) {

        console.error(
          "Google Register Error:",
          error
        );

        toast.error(
          error?.response?.data?.message ||
          "Google registration failed."
        );

      } finally {

        setGoogleLoading(false);
      }
    };

  // ==========================================
  // GOOGLE ERROR
  // ==========================================

  const handleGoogleError = () => {

    setGoogleLoading(false);

    toast.error(
      "Google registration failed."
    );
  };

  // ==========================================
  // EMAIL POPUP → LOGIN
  // ==========================================

  const handleClosePopup = () => {

    setShowPopup(false);

    navigate(
      "/login",
      {
        replace: true,
        state: {
          from: getReturnPath(),
          registeredEmail: email,
        },
      }
    );
  };

  // ==========================================
  // RETURN
  // ==========================================

  return (

    <div
      className="
        min-h-screen
        bg-cover
        bg-center
        flex
        items-center
        justify-center
        p-4
        md:p-8
        relative
        overflow-hidden
      "
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('/box.png')",
      }}
    >

      {/* ==========================================
          MAIN CARD
      ========================================== */}

      <div
        className="
          w-full
          max-w-6xl
          bg-white
          rounded-[32px]
          overflow-hidden
          shadow-2xl
          grid
          grid-cols-1
          lg:grid-cols-2
        "
      >

        {/* ==========================================
            LEFT SIDE
        ========================================== */}

        <div
          className="
            relative
            overflow-hidden
            p-6
            md:p-8
            flex
            flex-col
            justify-between
            text-white
            h-[480px]
            lg:h-[640px]
            border
            border-white/40
            m-3
            rounded-[28px]
          "
        >

          {/* Previous Image */}

          <div
            className="
              absolute
              inset-0
              bg-cover
              bg-center
            "
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
            className="
              absolute
              inset-0
              bg-cover
              bg-center
              animate-register-fade
            "
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

          {/* Slider Content */}

          <div
            className="
              relative
              z-10
              flex
              h-full
              flex-col
              justify-between
            "
          >

            {/* Top */}

            <div
              className="
                flex
                justify-between
                items-start
              "
            >

              <div>

                <span
                  className="
                    inline-flex
                    items-center
                    px-3
                    py-1
                    rounded-full
                    bg-white/10
                    backdrop-blur-md
                    border
                    border-white/20
                    text-[10px]
                    font-semibold
                    tracking-wider
                  "
                >
                  INFYNEST
                </span>

                <p className="text-xs text-gray-200 mt-3">
                  Fashion • Lifestyle • E-commerce
                </p>

              </div>

              {/* Counter */}

              <div
                className="
                  px-3
                  py-1.5
                  rounded-full
                  bg-black/30
                  backdrop-blur-md
                  border
                  border-white/20
                  text-[10px]
                  font-semibold
                "
              >
                {String(
                  currentImageIndex + 1
                ).padStart(2, "0")}{" "}
                /{" "}
                {String(
                  sliderImages.length
                ).padStart(2, "0")}
              </div>

            </div>

            {/* Center */}

            <div className="flex-1 flex items-center">

              <div className="max-w-md">

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    text-gray-300
                    mb-3
                  "
                >
                  Discover Your Style
                </p>

                <h2
                  className="
                    text-4xl
                    md:text-5xl
                    font-black
                    tracking-tight
                    leading-tight
                  "
                >
                  Style that
                  <br />

                  <span className="text-indigo-400">
                    speaks for you.
                  </span>
                </h2>

                <p
                  className="
                    mt-4
                    text-sm
                    text-gray-200
                    leading-relaxed
                    max-w-sm
                  "
                >
                  Discover premium fashion and
                  lifestyle products designed to
                  make every moment feel special.
                </p>

              </div>

            </div>

            {/* Bottom */}

            <div
              className="
                flex
                justify-between
                items-end
              "
            >

              {/* Brand */}

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-gradient-to-tr
                    from-orange-500
                    to-red-600
                    flex
                    items-center
                    justify-center
                    font-bold
                    text-sm
                  "
                >
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

              {/* Navigation */}

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={prevSlide}
                  disabled={
                    loading ||
                    googleLoading
                  }
                  className="
                    w-9
                    h-9
                    rounded-full
                    border
                    border-white/40
                    flex
                    items-center
                    justify-center
                    hover:bg-white/20
                    transition
                    disabled:opacity-50
                  "
                >
                  <HiArrowLeft size={15} />
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  disabled={
                    loading ||
                    googleLoading
                  }
                  className="
                    w-9
                    h-9
                    rounded-full
                    border
                    border-white/40
                    flex
                    items-center
                    justify-center
                    hover:bg-white/20
                    transition
                    disabled:opacity-50
                  "
                >
                  <HiArrowRight size={15} />
                </button>

              </div>

            </div>

          </div>
        </div>

        {/* ==========================================
            RIGHT SIDE
        ========================================== */}

        <div
          className="
            px-5
            sm:px-8
            md:px-10
            py-8
            flex
            flex-col
            justify-center
            bg-white
          "
        >

          {/* Header */}

          <div
            className="
              flex
              justify-between
              items-center
              mb-6
            "
          >

            <h1
              className="
                text-lg
                font-black
                text-black
                tracking-wider
              "
            >
              INFYNEST
            </h1>

            {/* Language */}

            <div
              className="
                flex
                items-center
                gap-1
                border
                border-gray-200
                px-2.5
                py-1.5
                rounded-lg
                text-xs
                font-semibold
                text-gray-700
                bg-gray-50
              "
            >

              <button
                type="button"
                onClick={() =>
                  changeLanguage("en")
                }
                disabled={
                  loading ||
                  googleLoading
                }
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
                onClick={() =>
                  changeLanguage("bn")
                }
                disabled={
                  loading ||
                  googleLoading
                }
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

            <h2
              className="
                text-2xl
                md:text-3xl
                font-black
                text-gray-900
                tracking-tight
              "
            >
              {t("create_account")}
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {t("welcome_platform")}
            </p>

          </div>

          {/* ==========================================
              REGISTER FORM
          ========================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >

            {/* Name */}

            <input
              type="text"
              placeholder={t("full_name")}
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
              disabled={
                loading ||
                googleLoading
              }
              autoComplete="name"
              className="
                w-full
                px-4
                py-3
                rounded-xl
                border
                border-gray-200
                focus:outline-none
                focus:border-black
                focus:ring-2
                focus:ring-black/5
                text-xs
                bg-gray-50/50
                text-gray-800
                placeholder-gray-400
              "
            />

            {/* Email */}

            <input
              type="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              disabled={
                loading ||
                googleLoading
              }
              autoComplete="email"
              className="
                w-full
                px-4
                py-3
                rounded-xl
                border
                border-gray-200
                focus:outline-none
                focus:border-black
                focus:ring-2
                focus:ring-black/5
                text-xs
                bg-gray-50/50
                text-gray-800
                placeholder-gray-400
              "
            />

            {/* Password */}

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder={t("password")}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                disabled={
                  loading ||
                  googleLoading
                }
                autoComplete="new-password"
                className="
                  w-full
                  px-4
                  py-3
                  pr-10
                  rounded-xl
                  border
                  border-gray-200
                  focus:outline-none
                  focus:border-black
                  focus:ring-2
                  focus:ring-black/5
                  text-xs
                  bg-gray-50/50
                  text-gray-800
                  placeholder-gray-400
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                disabled={
                  loading ||
                  googleLoading
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  hover:text-gray-700
                "
              >
                {showPassword ? (
                  <HiEyeOff size={16} />
                ) : (
                  <HiEye size={16} />
                )}
              </button>

            </div>

            {/* Admin Secret */}

            <input
              type="text"
              placeholder="Admin Secret Code (Leave blank if normal user)"
              value={secretCode}
              onChange={(e) =>
                setSecretCode(
                  e.target.value
                )
              }
              disabled={
                loading ||
                googleLoading
              }
              className="
                w-full
                px-4
                py-3.5
                rounded-xl
                border
                border-dashed
                border-orange-400
                text-xs
                bg-orange-50/30
                focus:outline-none
                focus:border-orange-600
                placeholder-gray-400
              "
            />

            {/* Divider */}

            <div
              className="
                relative
                flex
                py-2
                items-center
              "
            >

              <div className="flex-grow border-t border-gray-200" />

              <span
                className="
                  mx-4
                  text-gray-400
                  text-xs
                "
              >
                {t("or")}
              </span>

              <div className="flex-grow border-t border-gray-200" />

            </div>

            {/* ==========================================
                GOOGLE
            ========================================== */}

            <div className="w-full flex justify-center relative">

              {googleLoading && (
                <div
                  className="
                    absolute
                    inset-0
                    bg-white/70
                    z-10
                    flex
                    items-center
                    justify-center
                    rounded-lg
                  "
                >
                  <div
                    className="
                      w-5
                      h-5
                      border-2
                      border-gray-300
                      border-t-black
                      rounded-full
                      animate-spin
                    "
                  />
                </div>
              )}

              <div
                className={
                  loading
                    ? "opacity-50 pointer-events-none"
                    : ""
                }
              >

                <GoogleLogin
                  onSuccess={
                    handleGoogleSuccess
                  }
                  onError={
                    handleGoogleError
                  }
                />

              </div>

            </div>

            {/* Register Button */}

            <button
              type="submit"
              disabled={
                loading ||
                googleLoading
              }
              className="
                w-full
                py-3.5
                bg-[#f53b3b]
                hover:bg-[#e03131]
                disabled:opacity-60
                disabled:cursor-not-allowed
                text-white
                rounded-xl
                font-bold
                transition
                text-xs
                shadow-md
                shadow-red-500/20
                flex
                items-center
                justify-center
                gap-2
              "
            >

              {loading ? (
                <>
                  <span
                    className="
                      w-4
                      h-4
                      border-2
                      border-white/30
                      border-t-white
                      rounded-full
                      animate-spin
                    "
                  />

                  Processing...
                </>
              ) : (
                t("create_account")
              )}

            </button>

          </form>

          {/* Login */}

          <div className="mt-5 text-center">

            <p className="text-xs text-gray-500">

              {t("already_have_account")}{" "}

              <Link
                to="/login"
                state={{
                  from: getReturnPath(),
                }}
                className="
                  text-[#f53b3b]
                  font-semibold
                  hover:underline
                "
              >
                {t("log_in")}
              </Link>

            </p>

            {/* Social */}

            <div
              className="
                flex
                justify-center
                items-center
                gap-6
                mt-5
                text-gray-400
              "
            >

              <a
                href="#"
                onClick={(e) =>
                  e.preventDefault()
                }
                className="hover:text-black transition"
              >
                <FaFacebookF size={14} />
              </a>

              <a
                href="#"
                onClick={(e) =>
                  e.preventDefault()
                }
                className="hover:text-black transition"
              >
                <FaTwitter size={14} />
              </a>

              <a
                href="#"
                onClick={(e) =>
                  e.preventDefault()
                }
                className="hover:text-black transition"
              >
                <FaLinkedinIn size={14} />
              </a>

              <a
                href="#"
                onClick={(e) =>
                  e.preventDefault()
                }
                className="hover:text-black transition"
              >
                <FaInstagram size={14} />
              </a>

            </div>

          </div>

        </div>
      </div>

      {/* ==========================================
          EMAIL VERIFICATION POPUP
      ========================================== */}

      {showPopup && (

        <div
          className="
            fixed
            inset-0
            bg-black/60
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
            p-4
          "
        >

          <div
            className="
              bg-white
              p-6
              md:p-8
              rounded-[28px]
              shadow-2xl
              text-center
              max-w-sm
              w-full
            "
          >

            <div
              className="
                w-16
                h-16
                bg-red-50
                text-[#f53b3b]
                rounded-full
                flex
                items-center
                justify-center
                mx-auto
                mb-4
                text-2xl
              "
            >
              ✉️
            </div>

            <h3
              className="
                text-xl
                font-black
                text-gray-900
                mb-2
              "
            >
              Verify Your Email!
            </h3>

            <p
              className="
                text-gray-500
                text-xs
                leading-relaxed
                mb-6
              "
            >
              We have sent a verification link
              to your email address. Please check
              your inbox and verify your account
              before logging in.
            </p>

            <button
              type="button"
              onClick={handleClosePopup}
              className="
                w-full
                py-3
                bg-[#f53b3b]
                hover:bg-[#e03131]
                text-white
                rounded-xl
                font-bold
                transition
                text-xs
                shadow-md
                shadow-red-500/20
              "
            >
              Go to Login
            </button>

          </div>
        </div>
      )}

      {/* ==========================================
          ANIMATION
      ========================================== */}

      <style>
        {`
          @keyframes registerFade {
            from {
              opacity: 0;
              transform: scale(1.03);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-register-fade {
            animation: registerFade 0.8s ease-in-out;
          }
        `}
      </style>

    </div>
  );
};

export default Register;
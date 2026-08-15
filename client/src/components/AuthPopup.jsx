// File Path: src/components/AuthPopup.jsx

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import API from "../services/api";
import toast from "react-hot-toast";

export default function AuthPopup({ onClose, onSuccess }) {
  const [mode, setMode] = useState("choice");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);


  // ==========================================
// SAVE AUTH DATA
// ==========================================

const saveAuthData = (data) => {
  const token = data?.token;

  const user =
    data?.user ||
    data?.userData ||
    data?.data?.user ||
    data?.data?.userData ||
    data;

  if (token) {
    localStorage.setItem("token", token);
  }

  if (user) {
    localStorage.setItem(
      "userInfo",
      JSON.stringify(user)
    );
  }

  // Tell Layout that login state changed
  window.dispatchEvent(new Event("authChanged"));
};

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      console.log("Popup Login Response:", data);

      // Save user information
      saveAuthData(data);

      toast.success("Login Successful!");

setEmail("");
setPassword("");

saveAuthData(data);

if (onSuccess) {
  onSuccess(data);
}

if (onClose) {
  onClose();

}


    } catch (error) {
      console.error("Popup Login Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      console.log("Popup Register Response:", data);

      toast.success(
        "Registration successful! Please verify your email."
      );

      // Clear form
      setName("");
      setEmail("");
      setPassword("");

      // Show login screen after registration
      setMode("login");

    } catch (error) {
      console.error("Popup Register Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogleSuccess = async (credentialResponse) => {
    if (loading) return;

    try {
      setLoading(true);

      const { data } = await API.post(
        "/auth/google-login",
        {
          token: credentialResponse.credential,
        }
      );

      console.log(
        "Popup Google Login Response:",
        data
      );

      // Save user information
      saveAuthData(data);

toast.success("Login Successful!");

saveAuthData(data);

if (onSuccess) {
  onSuccess(data);
}

if (onClose) {
  onClose();
}

    } catch (error) {
      console.error(
        "Popup Google Login Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Google Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        bg-black/60
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
      "
    >
      <div
        className="
          relative
          w-full
          max-w-md
          bg-white
          rounded-3xl
          shadow-2xl
          p-6
          sm:p-8
        "
      >

        {/* ==========================================
            CLOSE BUTTON
        ========================================== */}

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="
            absolute
            top-4
            right-4
            w-8
            h-8
            rounded-full
            bg-gray-100
            hover:bg-gray-200
            text-gray-500
            hover:text-black
            transition
            disabled:opacity-50
          "
        >
          ✕
        </button>

        {/* ==========================================
            CHOICE SCREEN
        ========================================== */}

        {mode === "choice" && (
          <>
            <div className="text-center mb-7">

              <div
                className="
                  w-14
                  h-14
                  mx-auto
                  mb-4
                  rounded-2xl
                  bg-red-50
                  flex
                  items-center
                  justify-center
                  text-[#f53b3b]
                  font-black
                  text-lg
                "
              >
                IN
              </div>

              <h2
                className="
                  text-2xl
                  font-black
                  text-gray-900
                "
              >
                Welcome to INFYNEST
              </h2>

              <p
                className="
                  text-xs
                  text-gray-500
                  mt-2
                  leading-relaxed
                "
              >
                Please login or register to
                continue your purchase.
              </p>

            </div>

            {/* Buttons */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() => setMode("register")}
                className="
                  py-3.5
                  rounded-xl
                  bg-[#f53b3b]
                  hover:bg-[#e03131]
                  text-white
                  text-xs
                  font-bold
                  transition
                "
              >
                Register
              </button>

              <button
                type="button"
                onClick={() => setMode("login")}
                className="
                  py-3.5
                  rounded-xl
                  bg-gray-900
                  hover:bg-black
                  text-white
                  text-xs
                  font-bold
                  transition
                "
              >
                Login
              </button>

            </div>
          </>
        )}

        {/* ==========================================
            LOGIN SCREEN
        ========================================== */}

        {mode === "login" && (
          <>
            <div className="mb-6">

              <h2
                className="
                  text-2xl
                  font-black
                  text-gray-900
                "
              >
                Sign In
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Login to continue your order.
              </p>

            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >

              {/* Email */}

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
                required
                className="
                  w-full
                  px-4
                  py-3.5
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  text-gray-800
                  text-xs
                  focus:outline-none
                  focus:border-black
                  disabled:opacity-60
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
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={loading}
                  required
                  className="
                    w-full
                    px-4
                    py-3.5
                    pr-12
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    text-gray-800
                    text-xs
                    focus:outline-none
                    focus:border-black
                    disabled:opacity-60
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    hover:text-gray-700
                  "
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

              </div>

              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  py-3.5
                  rounded-xl
                  bg-[#f53b3b]
                  hover:bg-[#e03131]
                  text-white
                  text-xs
                  font-bold
                  transition
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Signing in..."
                  : "Login"}
              </button>

            </form>

            {/* Divider */}

            <div className="flex items-center gap-3 my-5">

              <div className="flex-1 border-t border-gray-200" />

              <span className="text-[10px] text-gray-400">
                OR
              </span>

              <div className="flex-1 border-t border-gray-200" />

            </div>

            {/* Google */}

            <div className="flex justify-center">

              <GoogleLogin
                onSuccess={
                  handleGoogleSuccess
                }
                onError={() =>
                  toast.error(
                    "Google Login failed."
                  )
                }
              />

            </div>

            {/* Register */}

            <p className="text-center text-xs text-gray-500 mt-5">

              Don't have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  setMode("register")
                }
                className="
                  text-[#f53b3b]
                  font-bold
                  hover:underline
                "
              >
                Register
              </button>

            </p>

          </>
        )}

        {/* ==========================================
            REGISTER SCREEN
        ========================================== */}

        {mode === "register" && (
          <>
            <div className="mb-6">

              <h2
                className="
                  text-2xl
                  font-black
                  text-gray-900
                "
              >
                Create Account
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Create an account to continue.
              </p>

            </div>

            <form
              onSubmit={handleRegister}
              className="space-y-4"
            >

              {/* Name */}

              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                disabled={loading}
                required
                className="
                  w-full
                  px-4
                  py-3.5
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  text-gray-800
                  text-xs
                  focus:outline-none
                  focus:border-black
                  disabled:opacity-60
                "
              />

              {/* Email */}

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
                required
                className="
                  w-full
                  px-4
                  py-3.5
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  text-gray-800
                  text-xs
                  focus:outline-none
                  focus:border-black
                  disabled:opacity-60
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
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={loading}
                  required
                  className="
                    w-full
                    px-4
                    py-3.5
                    pr-12
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    text-gray-800
                    text-xs
                    focus:outline-none
                    focus:border-black
                    disabled:opacity-60
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    hover:text-gray-700
                  "
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

              </div>

              {/* Register */}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  py-3.5
                  rounded-xl
                  bg-[#f53b3b]
                  hover:bg-[#e03131]
                  text-white
                  text-xs
                  font-bold
                  transition
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Creating account..."
                  : "Register"}
              </button>

            </form>

            {/* Divider */}

            <div className="flex items-center gap-3 my-5">

              <div className="flex-1 border-t border-gray-200" />

              <span className="text-[10px] text-gray-400">
                OR
              </span>

              <div className="flex-1 border-t border-gray-200" />

            </div>

            {/* Google */}

            <div className="flex justify-center">

              <GoogleLogin
                onSuccess={
                  handleGoogleSuccess
                }
                onError={() =>
                  toast.error(
                    "Google registration failed."
                  )
                }
              />

            </div>

            {/* Login */}

            <p className="text-center text-xs text-gray-500 mt-5">

              Already have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  setMode("login")
                }
                className="
                  text-[#f53b3b]
                  font-bold
                  hover:underline
                "
              >
                Login
              </button>

            </p>

          </>
        )}

      </div>
    </div>
  );
}
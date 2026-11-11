import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import img1 from "../../assets/login/img1.png";
import img2 from "../../assets/login/img2.png";
import img3 from "../../assets/login/img3.png";
import waveImage1 from "../../assets/login/Wave1.png";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";

/**
 * Presentational Component for the Login View.
 * Handles credential inputs, inline validation, password toggle,
 * remember-me persistence, and the visual illustration carousel.
 */
const Login = ({
  onSubmit,
  isLoading = false,
  onSignupClick,
}) => {
  const images = [img1, img2, img3];
  const [form, setForm] = useState({ businessEmail: "", password: "" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emptyErrors = { businessEmail: "", password: "" };
  const [error, setError] = useState(emptyErrors);

  // Rotating image carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Load saved credentials from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    const savedPassword = localStorage.getItem("rememberPassword");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, businessEmail: savedEmail }));
      setRememberMe(true);
    }
    if (savedPassword) {
      setForm((prev) => ({ ...prev, password: savedPassword }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const { businessEmail, password } = form;
    const newErrors = { ...emptyErrors };
    if (!businessEmail.trim()) {
      newErrors.businessEmail = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(businessEmail)) {
      newErrors.businessEmail = "Invalid email format";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.values(newErrors).some((err) => err !== "")) {
      setError(newErrors);
      return;
    }

    // Save or clear remember-me preference
    if (rememberMe) {
      localStorage.setItem("rememberEmail", form.businessEmail);
    } else {
      localStorage.removeItem("rememberEmail");
    }

    if (onSubmit) {
      onSubmit(form);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-14 page-card-enter">
        {/* Left Section: Executive Form Card */}
        <div className="w-full lg:w-1/2 max-w-xl">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_24px_70px_rgba(30,58,138,0.09)] p-7 sm:p-10 md:p-12 relative overflow-hidden transition-all duration-300">
            {/* Top Glowing Gradient Accent Line */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 opacity-90" />

            {/* Header Badge */}
            <div className="stagger-item-1 text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                HireTrack PORTAL
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2.5">
                Welcome Back
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Enter your credentials to access your talent workspace
              </p>
            </div>

            {/* Login Form */}
            <form className="w-full space-y-4" onSubmit={handleSubmit} noValidate>
              {/* Business Email Field */}
              <div className="stagger-item-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Mail size={18} />
                  </div>
                  <input
                    inputMode="email"
                    type="email"
                    placeholder="name@company.com"
                    value={form.businessEmail}
                    onChange={(e) => {
                      setForm({ ...form, businessEmail: e.target.value });
                      setError({ ...error, businessEmail: "" });
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                      error.businessEmail
                        ? "border-red-400 bg-red-50/30"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                </div>
                {error.businessEmail && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1 font-medium">
                    {error.businessEmail}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="stagger-item-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      setError({ ...error, password: "" });
                    }}
                    className={`w-full pl-10 pr-12 py-3 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                      error.password
                        ? "border-red-400 bg-red-50/30"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 cursor-pointer text-slate-400 hover:text-slate-600 transition p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error.password && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1 font-medium">
                    {error.password}
                  </p>
                )}
              </div>

              {/* Remember me & Forgot Password */}
              <div className="stagger-item-4 flex justify-between items-center text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900 transition">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to="/forgotpassword"
                  className="text-blue-600 hover:text-blue-800 font-semibold transition hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="stagger-item-5 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer relative overflow-hidden group bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to HireTrack</span>
                        <ArrowRight
                          size={18}
                          className="group-hover:translate-x-1 transition-transform duration-200"
                        />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </button>
              </div>
            </form>

            {/* Signup Navigation Link */}
            <div className="stagger-item-6 mt-2 pt-5 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={onSignupClick}
                  className="text-blue-600 hover:text-indigo-600 font-bold transition cursor-pointer underline underline-offset-4 decoration-blue-200 hover:decoration-blue-500"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Floating Presentation Artwork & Cards */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative">
          <div className="relative floating-artwork max-w-lg w-full flex flex-col items-center justify-center">
            {/* Glowing Backdrop Aura */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl -z-10" />

            {/* Main Illustration */}
            <img
              src={images[currentIndex]}
              alt="HireTrack Illustration"
              className="w-full max-w-md h-auto object-contain drop-shadow-[0_20px_35px_rgba(30,58,138,0.18)] transition-all duration-700 ease-in-out"
            />

            {/* Floating Live Metric Badges */}
            <div className="hidden sm:flex absolute -top-4 -left-2 bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_12px_32px_rgba(30,58,138,0.1)] rounded-2xl p-3.5 items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">Enterprise Grade</div>
                <div className="text-[11px] text-slate-500">End-to-end Encrypted</div>
              </div>
            </div>

            <div className="hidden sm:flex absolute -bottom-6 -right-2 bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_12px_32px_rgba(30,58,138,0.1)] rounded-2xl p-3.5 items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                99.9%
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">Recruitment Velocity</div>
                <div className="text-[11px] text-emerald-600 font-medium">Streamlined hiring</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gentle Bottom Ambient Wave */}
      <div className="absolute -bottom-16 left-0 right-0 pointer-events-none opacity-20 -z-0">
        <img src={waveImage1} alt="ambient wave" className="w-full scale-110 object-cover" />
      </div>
    </div>
  );
};

export default Login;

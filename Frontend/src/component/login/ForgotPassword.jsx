import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import img1 from "../../assets/login/img1.png";
import img2 from "../../assets/login/img2.png";
import img3 from "../../assets/login/img3.png";
import waveImage1 from "../../assets/login/Wave1.png";
import { ArrowLeft, ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useToast } from "../../utils/ToastContext";

const ForgotPassword = ({
  onSubmit,
  isSubmitting = false,
  onLoginClick,
  onSignupClick,
}) => {
  const images = [img1, img2, img3];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { showToast } = useToast();

  // Rotating image carousel matching Login screen timing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      showToast("Please enter your email", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      showToast("Please enter a valid email address", "error");
      return;
    }

    setError("");
    if (onSubmit) {
      onSubmit(email, images[currentIndex]);
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
                HireTrack RECOVERY
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2.5">
                Forgot Password?
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Enter your registered business email and we'll send you an encrypted link to reset your password.
              </p>
            </div>

            {/* Form */}
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 ${error
                        ? "border-red-400 bg-red-50/30"
                        : "border-slate-200 focus:border-blue-500"
                      }`}
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1 font-medium">
                    {error}
                  </p>
                )}
              </div>

              {/* Informative Security Tip */}
              <div className="stagger-item-3 flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100/80 text-slate-600 text-xs">
                <ShieldCheck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  For your security, we'll verify your email before generating a temporary reset token. The link expires shortly after delivery.
                </span>
              </div>

              {/* Submit Button */}
              <div className="stagger-item-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer relative overflow-hidden group bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Sending Reset Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
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

            {/* Navigation Links Footer */}
            <div className="stagger-item-5 mt-2 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <Link
                to="/"
                onClick={onLoginClick}
                className="text-slate-600 hover:text-blue-600 font-semibold transition inline-flex items-center gap-1.5 cursor-pointer hover:underline"
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </Link>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <p className="text-slate-500 text-xs sm:text-sm">
                Don't have an account?{" "}
                <Link
                  to="/createAccount"
                  onClick={onSignupClick}
                  className="text-blue-600 hover:text-indigo-600 font-bold transition cursor-pointer underline underline-offset-4 decoration-blue-200 hover:decoration-blue-500"
                >
                  Create account
                </Link>
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
              alt="HireTrack Recovery Illustration"
              className="w-full max-w-md h-auto object-contain drop-shadow-[0_20px_35px_rgba(30,58,138,0.18)] transition-all duration-700 ease-in-out"
            />

            {/* Floating Live Security Metric Badges */}
            <div className="hidden sm:flex absolute -top-4 -left-2 bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_12px_32px_rgba(30,58,138,0.1)] rounded-2xl p-3.5 items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">Enterprise Security</div>
                <div className="text-[11px] text-slate-500">256-bit Token Encryption</div>
              </div>
            </div>

            <div className="hidden sm:flex absolute -bottom-6 -right-2 bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_12px_32px_rgba(30,58,138,0.1)] rounded-2xl p-3.5 items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                <KeyRound size={20} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">Instant Recovery</div>
                <div className="text-[11px] text-emerald-600 font-medium">Verified email delivery</div>
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

export default ForgotPassword;

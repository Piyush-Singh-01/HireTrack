import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import img1 from "../../assets/login/img1.png";
import img2 from "../../assets/login/img2.png";
import img3 from "../../assets/login/img3.png";
import defaultImage from "../../assets/login/img1.png";
import waveImage1 from "../../assets/login/Wave1.png";
import PasswordUpdated from "./PasswordUpdated";
import { useToast } from "../../utils/ToastContext";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

/**
 * Presentational Component for Reset Password / Email Sent confirmation.
 * - Displays email sent notice if no token is present
 * - Displays new password form if token is present
 * - Displays PasswordUpdated confirmation if isPasswordUpdated is true
 * - Matches executive UI/UX design language of Login, Signup, and Forgot Password
 */
const ResetEmailSent = ({
  token,
  onSubmit,
  isSubmitting = false,
  isPasswordUpdated = false,
  stateImage,
  onLoginClick,
}) => {
  const images = stateImage ? [stateImage, img2, img3] : [img1, img2, img3];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "" });
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Rotating image carousel matching Login screen timing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      showToast("Invalid or expired link", "error");
      return;
    }

    const newErrors = { newPassword: "", confirmPassword: "" };
    let hasErr = false;

    if (!newPassword.trim()) {
      newErrors.newPassword = "Password is required";
      hasErr = true;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
      hasErr = true;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
      hasErr = true;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasErr = true;
    }

    if (hasErr) {
      setErrors(newErrors);
      if (!newPassword.trim() || !confirmPassword.trim()) {
        showToast("Please enter both passwords", "error");
      } else if (newPassword !== confirmPassword) {
        showToast("Passwords do not match", "error");
      } else if (newPassword.length < 6) {
        showToast("Password must be at least 6 characters", "error");
      }
      return;
    }

    setErrors({ newPassword: "", confirmPassword: "" });
    if (onSubmit) {
      onSubmit({ newPassword, confirmPassword });
    }
  };

  const handleBackToLogin = (e) => {
    if (onLoginClick) {
      onLoginClick(e);
    } else {
      navigate("/");
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

            {isPasswordUpdated ? (
              /* Case 1: Password Updated Confirmation */
              <PasswordUpdated onLoginClick={onLoginClick} />
            ) : !token ? (
              /* Case 2: Email Sent Notice (No Token) */
              <div>
                {/* Header Badge */}
                <div className="stagger-item-1 text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold tracking-wide shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                    HireTrack DISPATCH
                  </div>
                </div>

                {/* Animated Dispatch Icon */}
                <div className="stagger-item-2 flex justify-center mb-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-cyan-500/15 border border-blue-200/60 flex items-center justify-center shadow-inner">
                      <Mail size={38} className="text-blue-600 animate-bounce" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <CheckCircle2 size={15} />
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="stagger-item-3 text-center mb-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Check Your Email
                  </h1>
                  <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                    We've sent a password reset link to your business email address. Please follow the instructions to reset your credentials.
                  </p>
                </div>

                {/* Instruction Notes */}
                <div className="stagger-item-4 mb-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-slate-600 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <ShieldCheck size={16} className="text-blue-600" />
                    <span>Next Steps</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-500 space-y-1 pl-1">
                    <li>Check your inbox and spam/junk folder</li>
                    <li>Click the secure link in the email</li>
                    <li>The recovery link expires in 15 minutes</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="stagger-item-5 space-y-3">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="w-full cursor-pointer relative overflow-hidden group bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span>Back to Sign In</span>
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      to="/forgotpassword"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition hover:underline"
                    >
                      Didn't receive the email? Try another address
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Case 3: Token Present -> Reset Password Form */
              <div>
                {/* Header Badge */}
                <div className="stagger-item-1 text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold tracking-wide shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                    HireTrack SECURITY
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2.5">
                    Set New Password
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Create a new secure password for your workspace account
                  </p>
                </div>

                <form className="w-full space-y-4" onSubmit={handleSubmit} noValidate>
                  {/* New Password Field */}
                  <div className="stagger-item-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, newPassword: "" }));
                        }}
                        className={`w-full pl-10 pr-12 py-3 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                          errors.newPassword
                            ? "border-red-400 bg-red-50/30"
                            : "border-slate-200 focus:border-blue-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 cursor-pointer text-slate-400 hover:text-slate-600 transition p-1"
                        aria-label="Toggle new password visibility"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1 font-medium">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="stagger-item-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        }}
                        className={`w-full pl-10 pr-12 py-3 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                          errors.confirmPassword
                            ? "border-red-400 bg-red-50/30"
                            : "border-slate-200 focus:border-blue-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 cursor-pointer text-slate-400 hover:text-slate-600 transition p-1"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1 font-medium">
                        {errors.confirmPassword}
                      </p>
                    )}
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
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <span>Reset Password</span>
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

                {/* Footer Back Link */}
                <div className="stagger-item-5 mt-4 pt-5 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-slate-600 hover:text-blue-600 font-semibold transition inline-flex items-center gap-1.5 cursor-pointer text-sm hover:underline"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Floating Presentation Artwork & Cards */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative">
          <div className="relative floating-artwork max-w-lg w-full flex flex-col items-center justify-center">
            {/* Glowing Backdrop Aura */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl -z-10" />

            {/* Main Illustration */}
            <img
              src={images[currentIndex] || defaultImage}
              alt="HireTrack Recovery Illustration"
              className="w-full max-w-md h-auto object-contain drop-shadow-[0_20px_35px_rgba(30,58,138,0.18)] transition-all duration-700 ease-in-out"
            />

            {/* Floating Live Security Metric Badges */}
            <div className="hidden sm:flex absolute -top-4 -left-2 bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_12px_32px_rgba(30,58,138,0.1)] rounded-2xl p-3.5 items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">Secure Protocol</div>
                <div className="text-[11px] text-slate-500">End-to-End Cryptographic</div>
              </div>
            </div>

            <div className="hidden sm:flex absolute -bottom-6 -right-2 bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_12px_32px_rgba(30,58,138,0.1)] rounded-2xl p-3.5 items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                <KeyRound size={20} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">Account Access</div>
                <div className="text-[11px] text-emerald-600 font-medium">Single-click activation</div>
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

export default ResetEmailSent;

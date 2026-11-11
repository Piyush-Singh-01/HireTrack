import React, { useEffect, useState } from "react";
import emailsent from "../../assets/login/emailsent.png";
import waveImage1 from "../../assets/login/Wave1.png";
import { Link } from "react-router-dom";
import PasswordUpdated from "./PasswordUpdated";
import defaultImage from "../../assets/login/img1.png";
import { useToast } from "../../utils/ToastContext";

/**
 * Presentational Component for Reset Password / Email Sent confirmation.
 * - Displays email sent notice if no token is present
 * - Displays new password form if token is present
 * - Displays PasswordUpdated confirmation if isPasswordUpdated is true
 */
const ResetEmailSent = ({
  token,
  onSubmit,
  isSubmitting = false,
  isPasswordUpdated = false,
  stateImage,
}) => {
  const [animate, setAnimate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const waveInterval = setInterval(() => {
      setAnimate((prev) => !prev);
    }, 3500);
    return () => clearInterval(waveInterval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) {
      showToast("Invalid or expired link", "error");
      return;
    }
    if (!newPassword || !confirmPassword) {
      showToast("Please enter both passwords", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    if (onSubmit) {
      onSubmit({ newPassword, confirmPassword });
    }
  };

  return (
    <div className="flex h-screen relative bg-white overflow-hidden w-full">
      {/* Animated Wave Background */}
      <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none">
        <img
          src={waveImage1}
          alt="wave"
          className={`absolute -bottom-130 w-[150%] scale-[1.4] transition-all duration-[10000ms] ease-in-out ${
            animate ? "translate-x-[120%]" : "-translate-x-[120%]"
          }`}
        />
        <img
          src={waveImage1}
          alt="wave"
          className={`absolute -bottom-125 w-[150%] left-20 scale-[1.4] opacity-70 transition-all duration-[10000ms] ease-in-out ${
            animate ? "translate-x-[120%]" : "-translate-x-[120%]"
          }`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full z-10">
        {/* Left Section: Illustration */}
        <div className="hidden md:flex justify-center items-center">
          <img
            src={stateImage || defaultImage}
            alt="Reset Password Illustration"
            className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] object-contain"
          />
        </div>

        {/* Right Section: Form or Confirmation Card */}
        <div className="flex flex-col justify-center items-center px-6 md:px-12">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            {isPasswordUpdated ? (
              <PasswordUpdated />
            ) : !token ? (
              /* Case 1: No Token -> Email Sent Notice */
              <div className="flex flex-col justify-between py-4 text-center">
                <div className="flex justify-center mb-6">
                  <img
                    src={emailsent}
                    alt="Email Sent"
                    className="w-[120px] h-[70px] md:w-[150px] md:h-[80px]"
                  />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Check Your Email</h2>
                <p className="text-sm text-slate-500 mb-6">
                  We've sent a password reset link to your business email address. Please follow the link to reset your credentials.
                </p>
                <div>
                  <Link
                    to="/"
                    className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              /* Case 2: Token Present -> Reset Password Form */
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Set New Password</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Create a new secure password for your account.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-60"
                  >
                    {isSubmitting ? "Updating..." : "Reset Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetEmailSent;

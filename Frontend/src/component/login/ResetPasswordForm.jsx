import React, { useEffect, useState } from "react";
import img1 from "../../assets/login/img1.png";
import img2 from "../../assets/login/img2.png";
import img3 from "../../assets/login/img3.png";
import waveImage1 from "../../assets/login/Wave1.png";
import PasswordUpdated from "./PasswordUpdated";
import { useToast } from "../../utils/ToastContext";

const ResetPasswordForm = ({
  token,
  onSubmit,
  isSubmitting = false,
  isPasswordUpdated = false,
}) => {
  const images = [img1, img2, img3];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Wave Background */}
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
        <div className="hidden md:flex justify-center items-center">
          <img
            src={images[currentIndex]}
            alt="Illustration"
            className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] transition-all duration-500 ease-in-out"
          />
        </div>

        <div className="flex flex-col justify-center items-center px-6 md:px-12">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            {isPasswordUpdated ? (
              <PasswordUpdated />
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Please enter and confirm your new password below.
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
                    {isSubmitting ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordForm;

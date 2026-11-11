import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import img1 from "../../assets/login/img1.png";
import img2 from "../../assets/login/img2.png";
import img3 from "../../assets/login/img3.png";
import waveImage1 from "../../assets/login/Wave1.png";
import { useToast } from "../../utils/ToastContext";

/**
 * Presentational Component for Forgot Password screen.
 * Handles email input, format validation, illustration carousel,
 * and calls onSubmit with the validated email.
 */
const ForgotPassword = ({
  onSubmit,
  isSubmitting = false,
}) => {
  const images = [img1, img2, img3];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Toggle wave movement back and forth
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setAnimate((prev) => !prev);
    }, 10000);
    return () => clearInterval(waveInterval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Please enter your email", "error");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    if (onSubmit) {
      onSubmit(email, images[currentIndex]);
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
        <img
          src={waveImage1}
          alt="wave"
          className={`absolute -bottom-130 w-[150%] -left-20 scale-[1.4] opacity-50 transition-all duration-[12000ms] ease-in-out ${
            animate ? "-translate-x-[120%]" : "translate-x-100"
          }`}
        />
        <img
          src={waveImage1}
          alt="wave"
          className={`absolute -bottom-125 w-[150%] -left-30 scale-[1.4] opacity-40 transition-all duration-[12000ms] ease-in-out ${
            animate ? "-translate-x-[120%]" : "translate-x-100"
          }`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full z-10">
        {/* Left Section: Illustration Carousel */}
        <div className="hidden md:flex justify-center items-center">
          <img
            src={images[currentIndex]}
            alt="Forgot Password Illustration"
            className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] transition-all duration-500 ease-in-out"
          />
        </div>

        {/* Right Section: Form Card */}
        <div className="flex flex-col justify-center items-center px-6 md:px-12">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password</h2>
            <p className="text-sm text-slate-500 mb-6">
              Enter your registered email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-60"
              >
                {isSubmitting ? "Sending Link..." : "Send Request Link"}
              </button>

              <div className="text-center pt-3 border-t border-slate-100 mt-4">
                <Link
                  to="/"
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

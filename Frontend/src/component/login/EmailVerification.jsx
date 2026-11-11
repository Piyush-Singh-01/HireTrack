import React, { useEffect, useState } from "react";
import img1 from "../../assets/login/img1.png";
import img2 from "../../assets/login/img2.png";
import img3 from "../../assets/login/img3.png";
import waveImage from "../../assets/login/wave.png";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

/**
 * Presentational Component for Email Verification.
 * Displays verification status UI (verifying spinner, success badge, error alert)
 * along with the illustration carousel.
 */
const EmailVerification = ({
  verificationStatus = "verifying", // "verifying" | "success" | "error"
  message = "",
  user = null,
  onLoginNavigate,
  onRetry,
}) => {
  const images = [img1, img2, img3];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="flex h-screen relative bg-white overflow-hidden w-full">
      {/* Animated Wave Background */}
      <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none opacity-25">
        <img src={waveImage} alt="wave" className="w-full object-cover" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full z-10">
        {/* Left Section: Illustration */}
        <div className="hidden md:flex justify-center items-center">
          <img
            src={images[currentIndex]}
            alt="Verification Illustration"
            className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] object-contain transition-all duration-500 ease-in-out"
          />
        </div>

        {/* Right Section: Verification Card */}
        <div className="flex flex-col justify-center items-center px-6 md:px-12">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
            {verificationStatus === "verifying" && (
              <div className="py-8">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Verifying Your Email</h2>
                <p className="text-sm text-slate-500">
                  Please wait while we confirm your email address...
                </p>
              </div>
            )}

            {verificationStatus === "success" && (
              <div className="py-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
                <p className="text-sm text-slate-600 mb-6">
                  {message || "Your email address has been successfully verified."}
                </p>
                {user && (
                  <div className="bg-slate-50 rounded-xl p-3 mb-6 text-xs text-slate-600">
                    Verified for: <strong className="text-slate-800">{user.userName || user.email}</strong>
                  </div>
                )}
                <button
                  onClick={onLoginNavigate}
                  className="w-full flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition"
                >
                  <span>Continue to Sign In</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

            {verificationStatus === "error" && (
              <div className="py-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle size={36} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
                <p className="text-sm text-slate-600 mb-6">
                  {message || "We were unable to verify your email. The link may be expired or invalid."}
                </p>
                <div className="space-y-3">
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="w-full cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition"
                    >
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={onLoginNavigate}
                    className="w-full flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition"
                  >
                    <span>Back to Sign In</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;

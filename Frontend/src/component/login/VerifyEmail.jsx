import React from "react";
import { FaRegCircleCheck } from "react-icons/fa6";

/**
 * Presentational Component for manual token email verification button.
 */
const VerifyEmail = ({
  onVerify,
  loading = false,
  message = "",
  isVerified = false,
  onLoginNavigate,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#14324b] px-4 w-full">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 text-center relative">
        <h2 className="text-2xl font-semibold text-[#243B52] mb-4">
          Email Verification
        </h2>

        {!isVerified ? (
          <>
            <p className="text-gray-600 mb-6">
              Click the button below to verify your email address.
            </p>

            <button
              onClick={onVerify}
              disabled={loading}
              className="w-full bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition cursor-pointer disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            {message && (
              <p className="text-red-500 text-sm mt-4 font-medium">
                {message}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <FaRegCircleCheck className="text-green-500 text-5xl" />
            </div>

            <p className="text-gray-700 font-medium mb-6">
              {message}
            </p>

            <button
              onClick={onLoginNavigate}
              className="w-full bg-blue text-white font-semibold py-3 rounded-xl hover:bg-blue transition cursor-pointer"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
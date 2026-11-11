import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiRoutes from "../../utils/ApiRoutes";
import axiosInstance from "../../utils/AxiosInstance";
import { useToast } from "../../utils/ToastContext";
import ForgotPassword from "../../component/login/ForgotPassword";

/**
 * ForgotPasswordPage Component (Route: "/forgotpassword")
 *
 * Page Controller for requesting a password reset email:
 * - Sets document title
 * - Handles API network call to USERS.FORGOT_PASSWORD
 * - Coordinates navigation to /resetPasswordEmail on success
 * - Manages submission loading state and error handling
 */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Forgot Password | HireTrack";
  }, []);

  const handleRequestLink = async (email, image) => {
    try {
      setIsSubmitting(true);
      await axiosInstance.post(ApiRoutes.USERS.FORGOT_PASSWORD, {
        businessEmail: email,
      });
      showToast("Reset link sent to your email", "success");
      navigate("/resetPasswordEmail", {
        state: { image },
      });
    } catch (err) {
      console.error("Forgot password error:", err);
      showToast(err.response?.data?.message || "Failed to send reset link", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center">
      <ForgotPassword
        onSubmit={handleRequestLink}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ForgotPasswordPage;

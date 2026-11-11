import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ApiRoutes from "../../utils/ApiRoutes";
import axiosInstance from "../../utils/AxiosInstance";
import { useToast } from "../../utils/ToastContext";
import ResetPasswordForm from "../../component/login/ResetPasswordForm";

/**
 * ResetPasswordFormPage Component (Route: "/resetPasswordForm")
 *
 * Page Controller for the dedicated Reset Password Form route:
 * - Reads token from route parameters
 * - Handles API network submission
 * - Tracks password update status and notifies user
 */
const ResetPasswordFormPage = () => {
  const { token } = useParams();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);

  useEffect(() => {
    document.title = "Reset Password | HireTrack";
  }, []);

  const handleResetSubmit = async ({ newPassword, confirmPassword }) => {
    if (!token) {
      showToast("Invalid or expired link", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.post(
        `${ApiRoutes.USERS.RESET_PASSWORD}?token=${encodeURIComponent(token)}`,
        { newPassword, confirmPassword }
      );
      setIsPasswordUpdated(true);
      showToast("Password updated successfully", "success");
    } catch (err) {
      console.error("Reset password form error:", err);
      showToast(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center">
      <ResetPasswordForm
        token={token}
        onSubmit={handleResetSubmit}
        isSubmitting={isSubmitting}
        isPasswordUpdated={isPasswordUpdated}
      />
    </div>
  );
};

export default ResetPasswordFormPage;

import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import ApiRoutes from "../../utils/ApiRoutes";
import axiosInstance from "../../utils/AxiosInstance";
import { useToast } from "../../utils/ToastContext";
import ResetEmailSent from "../../component/login/ResetEmailSent";

/**
 * ResetEmailSentPage Component (Route: "/resetPasswordEmail" and "/reset-password/:token")
 *
 * Page Controller for Password Reset Flow:
 * - Extracts verification token from URL parameters if available
 * - Handles password update network submission
 * - Tracks password update status and notifies user via toast
 * - Passes data down to ResetEmailSent presentation component
 */
const ResetEmailSentPage = () => {
  const { token } = useParams();
  const location = useLocation();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);

  useEffect(() => {
    document.title = token ? "Reset Password | HireTrack" : "Email Sent | HireTrack";
  }, [token]);

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
      console.error("Password reset error:", err);
      showToast(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center">
      <ResetEmailSent
        token={token}
        onSubmit={handleResetSubmit}
        isSubmitting={isSubmitting}
        isPasswordUpdated={isPasswordUpdated}
        stateImage={location.state?.image}
      />
    </div>
  );
};

export default ResetEmailSentPage;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/AxiosInstance";
import VerifyEmail from "../../component/login/VerifyEmail";

/**
 * VerifyEmailPage Component (Route: "/verify-email/:token")
 *
 * Page Controller for manual token verification:
 * - Reads token from URL
 * - Coordinates verification API call
 * - Passes verification state to VerifyEmail presentation component
 */
const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    document.title = "Verify Email | HireTrack";
  }, []);

  const handleVerify = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await axiosInstance.get(`/api/users/v1/verify-email/${token}`);

      if (res.data.success) {
        setIsVerified(true);
        setMessage(res.data.message || "Email verified successfully!");
      } else {
        setMessage("Verification failed");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Verification failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <VerifyEmail
      onVerify={handleVerify}
      loading={loading}
      message={message}
      isVerified={isVerified}
      onLoginNavigate={() => navigate("/")}
    />
  );
};

export default VerifyEmailPage;

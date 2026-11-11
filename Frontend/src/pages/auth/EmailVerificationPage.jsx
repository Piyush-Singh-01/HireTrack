import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiRoutes from "../../utils/ApiRoutes";
import axiosInstance from "../../utils/AxiosInstance";
import EmailVerification from "../../component/login/EmailVerification";

/**
 * EmailVerificationPage Component (Route: "/verify-email" and "/verify-email/:token")
 *
 * Page Controller for Email Verification:
 * - Extracts verification token from URL
 * - Coordinates verification API call on page load
 * - Manages verification status lifecycle (verifying, success, error)
 * - Passes state to EmailVerification presentation component
 */
const EmailVerificationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.title = "Email Verification | HireTrack";
  }, []);

  const verifyEmail = async () => {
    if (!token) {
      setVerificationStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    try {
      setVerificationStatus("verifying");
      const response = await axiosInstance.get(`${ApiRoutes.USERS.VERIFY_EMAIL}/${token}`);

      if (response.data.success) {
        setVerificationStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
        setUser(response.data.user);
      } else {
        setVerificationStatus("error");
        setMessage(response.data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      setVerificationStatus("error");
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage("An error occurred during verification. Please try again.");
      }
    }
  };

  useEffect(() => {
    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center">
      <EmailVerification
        verificationStatus={verificationStatus}
        message={message}
        user={user}
        onLoginNavigate={() => navigate("/")}
        onRetry={verifyEmail}
      />
    </div>
  );
};

export default EmailVerificationPage;

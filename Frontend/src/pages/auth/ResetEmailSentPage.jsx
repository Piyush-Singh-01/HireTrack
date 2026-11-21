import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ApiRoutes from "../../utils/ApiRoutes";
import axiosInstance from "../../utils/AxiosInstance";
import { useToast } from "../../utils/ToastContext";
import ResetEmailSent from "../../component/login/ResetEmailSent";
import { Sparkles } from "lucide-react";

/**
 * ResetEmailSentPage Component (Route: "/resetPasswordEmail" and "/reset-password/:token")
 *
 * Page Controller for Password Reset Flow:
 * - Extracts verification token from URL parameters if available
 * - Handles password update network submission
 * - Tracks password update status and notifies user via toast
 * - Passes data down to ResetEmailSent presentation component
 * - Matches the layout, presentation beam, ambient orbs, and transition curtain UX of Login, Signup & Forgot Password
 */
const ResetEmailSentPage = () => {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageReveal, setPageReveal] = useState(false);

  useEffect(() => {
    document.title = token ? "Reset Password | HireTrack" : "Email Sent | HireTrack";
  }, [token]);

  // Trigger page reveal animation if navigated from Forgot Password
  useEffect(() => {
    if (location.state?.image || location.state?.fromForgot || location.state?.fromLogin) {
      setPageReveal(true);
      const timer = setTimeout(() => {
        setPageReveal(false);
        window.history.replaceState({}, document.title);
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Navigate to login with sweeping curtain
  const handleLoginClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/", { state: { fromForgot: true } });
    }, 600);
  };

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
    <div className="relative min-h-screen w-full bg-[#f8faff] text-slate-800 overflow-hidden flex flex-col justify-center items-center p-4 md:p-8">
      {/* Top Laser Progress Beam for Page Load / Refresh */}
      <div className="presentation-top-laser" key={location.key} />

      {/* Ambient Lighting Orbs */}
      <div className="presentation-ambient-orb presentation-ambient-orb-1" />
      <div className="presentation-ambient-orb presentation-ambient-orb-2" />
      <div className="presentation-ambient-orb presentation-ambient-orb-center" />

      {/* Subtle Matrix Dot Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1e3a8a_1.5px,transparent_1.5px)] [background-size:26px_26px]" />

      {/* Presentation Component */}
      <ResetEmailSent
        token={token}
        onSubmit={handleResetSubmit}
        isSubmitting={isSubmitting}
        isPasswordUpdated={isPasswordUpdated}
        stateImage={location.state?.image}
        onLoginClick={handleLoginClick}
      />

      {/* Exit Curtain: Sweeping into Login */}
      {isTransitioning && (
        <div className="portal-transition-overlay portal-curtain-in" aria-hidden="true">
          <div className="portal-veil" />
          <div className="portal-grid-pattern" />
          <div className="portal-laser-edge" />
          <div className="portal-center-badge">
            <div className="portal-spinner-ring" />
            <span className="portal-badge-text">
              <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              Accessing Login Portal...
            </span>
          </div>
        </div>
      )}

      {/* Reveal Curtain: Entering ResetEmailSent */}
      {pageReveal && (
        <div className="portal-transition-overlay portal-curtain-out" aria-hidden="true">
          <div className="portal-veil" />
          <div className="portal-grid-pattern" />
          <div className="portal-laser-edge-left" />
          <div className="portal-center-badge">
            <div className="portal-spinner-ring" />
            <span className="portal-badge-text">
              <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              HireTrack Security
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetEmailSentPage;

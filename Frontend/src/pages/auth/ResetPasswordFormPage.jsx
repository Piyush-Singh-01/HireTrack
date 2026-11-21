import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ApiRoutes from "../../utils/ApiRoutes";
import axiosInstance from "../../utils/AxiosInstance";
import { useToast } from "../../utils/ToastContext";
import ResetPasswordForm from "../../component/login/ResetPasswordForm";
import { Sparkles } from "lucide-react";

/**
 * ResetPasswordFormPage Component (Route: "/resetPasswordForm")
 *
 * Page Controller for Reset Password Form:
 * - Coordinates token extraction and new password submission
 * - Matches executive UI/UX design language of Login, Signup, and Forgot Password views
 */
const ResetPasswordFormPage = () => {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageReveal, setPageReveal] = useState(false);

  useEffect(() => {
    document.title = "Reset Password | HireTrack";
  }, []);

  // Trigger page reveal animation if navigated from another page
  useEffect(() => {
    if (location.state?.fromForgot || location.state?.fromLogin) {
      setPageReveal(true);
      const timer = setTimeout(() => {
        setPageReveal(false);
        window.history.replaceState({}, document.title);
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

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
      console.error("Reset password form error:", err);
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

      {/* Form Component */}
      <ResetPasswordForm
        token={token}
        onSubmit={handleResetSubmit}
        isSubmitting={isSubmitting}
        isPasswordUpdated={isPasswordUpdated}
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

      {/* Reveal Curtain */}
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

export default ResetPasswordFormPage;

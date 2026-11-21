import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiRoutes from "../../utils/ApiRoutes";
import axiosInstance from "../../utils/AxiosInstance";
import { useToast } from "../../utils/ToastContext";
import ForgotPassword from "../../component/login/ForgotPassword";
import { Sparkles } from "lucide-react";

/**
 * ForgotPasswordPage Component (Route: "/forgotpassword")
 *
 * Page Controller for requesting a password reset email:
 * - Sets document title
 * - Coordinates authentication recovery with USERS.FORGOT_PASSWORD API endpoint
 * - Directs user to /resetPasswordEmail upon successful link dispatch
 * - Matches the layout, presentation beam, ambient orbs, and transition curtain UX of Login & Signup
 */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState("login");
  const [pageReveal, setPageReveal] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = "Forgot Password | HireTrack";
  }, []);

  // Trigger page reveal animation if navigated from Login or CreateAccount
  useEffect(() => {
    if (location.state?.fromLogin || location.state?.fromCreate) {
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
    setTransitionTarget("login");
    setTimeout(() => {
      navigate("/", { state: { fromForgot: true } });
    }, 600);
  };

  // Navigate to create account with sweeping curtain
  const handleSignupClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTransitionTarget("signup");
    setTimeout(() => {
      navigate("/createAccount", { state: { fromForgot: true } });
    }, 600);
  };

  // Submit forgot password request
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
    <div className="relative min-h-screen w-full bg-[#f8faff] text-slate-800 overflow-hidden flex flex-col justify-center items-center p-4 md:p-8">
      {/* Top Laser Progress Beam for Page Load / Refresh */}
      <div className="presentation-top-laser" key={location.key} />

      {/* Ambient Lighting Orbs */}
      <div className="presentation-ambient-orb presentation-ambient-orb-1" />
      <div className="presentation-ambient-orb presentation-ambient-orb-2" />
      <div className="presentation-ambient-orb presentation-ambient-orb-center" />

      {/* Subtle Matrix Dot Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1e3a8a_1.5px,transparent_1.5px)] [background-size:26px_26px]" />

      {/* Forgot Password Presentational Component */}
      <ForgotPassword
        onSubmit={handleRequestLink}
        isSubmitting={isSubmitting}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />

      {/* Exit Curtain: Sweeping into Login or CreateAccount */}
      {isTransitioning && (
        <div className="portal-transition-overlay portal-curtain-in" aria-hidden="true">
          <div className="portal-veil" />
          <div className="portal-grid-pattern" />
          <div className="portal-laser-edge" />
          <div className="portal-center-badge">
            <div className="portal-spinner-ring" />
            <span className="portal-badge-text">
              <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              {transitionTarget === "signup"
                ? "Opening Registration..."
                : "Accessing Login Portal..."}
            </span>
          </div>
        </div>
      )}

      {/* Reveal Curtain: Entering ForgotPassword */}
      {pageReveal && (
        <div className="portal-transition-overlay portal-curtain-out" aria-hidden="true">
          <div className="portal-veil" />
          <div className="portal-grid-pattern" />
          <div className="portal-laser-edge-left" />
          <div className="portal-center-badge">
            <div className="portal-spinner-ring" />
            <span className="portal-badge-text">
              <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              Account Recovery
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;

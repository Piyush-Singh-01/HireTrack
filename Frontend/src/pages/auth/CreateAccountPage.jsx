import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRegister } from "../../hooks/useRegister";
import { useToast } from "../../utils/ToastContext";
import CreateAccount from "../../component/login/CreateAccount";
import { Sparkles } from "lucide-react";

/**
 * CreateAccountPage Component (Route: "/createAccount")
 *
 * Page Controller for User Registration:
 * - Coordinates account registration with useRegister hook
 * - Manages route transition animations and page reveal state
 * - Sets page title & manages user feedback toasts
 * - Houses the layout and delegates presentation to CreateAccount component
 */
const CreateAccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { mutate, isLoading } = useRegister();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageReveal, setPageReveal] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Create Account | HireTrack";
  }, []);

  // Reveal curtain when entering from Login
  useEffect(() => {
    if (location.state?.fromLogin) {
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
      navigate("/", { state: { fromCreate: true } });
    }, 600);
  };

  // Submit registration form
  const handleRegisterSubmit = (formData) => {
    mutate(formData, {
      onSuccess: (response) => {
        showToast(response.message || "Account created successfully!", "success");
        setIsTransitioning(true);
        setTimeout(() => {
          navigate("/", { state: { fromCreate: true } });
        }, 600);
      },
      onError: (err) => {
        showToast(err.response?.data?.message || err.message, "error");
      },
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f5f8ff] overflow-hidden flex flex-col justify-center items-center">
      {/* Top Laser Progress Beam for Page Load / Refresh */}
      <div className="presentation-top-laser" key={location.key} />

      {/* Registration Component */}
      <CreateAccount
        onSubmit={handleRegisterSubmit}
        isLoading={isLoading}
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

      {/* Reveal Curtain: Entering CreateAccount from Login */}
      {pageReveal && (
        <div className="portal-transition-overlay portal-curtain-out" aria-hidden="true">
          <div className="portal-veil" />
          <div className="portal-grid-pattern" />
          <div className="portal-laser-edge-left" />
          <div className="portal-center-badge">
            <div className="portal-spinner-ring" />
            <span className="portal-badge-text">
              <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              Welcome to HireTrack
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccountPage;

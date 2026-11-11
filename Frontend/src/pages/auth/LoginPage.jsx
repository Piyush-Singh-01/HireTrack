import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useAuth from "../../hooks/useAuth";
import Login from "../../component/login/Login";
import { Sparkles } from "lucide-react";

/**
 * LoginPage Component (Route: "/")
 *
 * Page Controller for User Authentication:
 * - Redirects authenticated users with tokens to /dashboard
 * - Sets document title & manages route transition curtains
 * - Coordinates authentication submission with the useAuth hook
 * - Houses the layout shell and renders the Login component
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((state) => state.auth.token);
  const { login, isLoading } = useAuth();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageReveal, setPageReveal] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = "Sign In | HireTrack";
  }, []);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  // Trigger page reveal animation if navigated from CreateAccount
  useEffect(() => {
    if (location.state?.fromCreate) {
      setPageReveal(true);
      const timer = setTimeout(() => {
        setPageReveal(false);
        window.history.replaceState({}, document.title);
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Navigate to Registration with smooth sweeping curtain animation
  const handleSignupClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/createAccount", { state: { fromLogin: true } });
    }, 600);
  };

  // Submit login credentials
  const handleLoginSubmit = (credentials) => {
    login(credentials);
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

      {/* Login Presentational Component */}
      <Login
        onSubmit={handleLoginSubmit}
        isLoading={isLoading}
        onSignupClick={handleSignupClick}
      />

      {/* Exit Curtain: Sweeping into CreateAccount */}
      {isTransitioning && (
        <div className="portal-transition-overlay portal-curtain-in" aria-hidden="true">
          <div className="portal-veil" />
          <div className="portal-grid-pattern" />
          <div className="portal-laser-edge" />
          <div className="portal-center-badge">
            <div className="portal-spinner-ring" />
            <span className="portal-badge-text">
              <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              Opening Registration...
            </span>
          </div>
        </div>
      )}

      {/* Reveal Curtain: Entering Login from CreateAccount */}
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

export default LoginPage;

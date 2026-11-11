import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { axiosInstance, DEFAULT_BASE_URL } from "../../utils/AxiosInstance";
import { logout, setCredentials } from "../../store/slice/LoginSlice";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";

const SessionTimeoutPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds countdown in popup
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { token, refreshToken, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const handleContinue = async (e) => {
    if (e) e.preventDefault();
    setIsRefreshing(true);
    try {
      // Use direct axios to avoid interceptor loops
      const response = await axios.post(`${DEFAULT_BASE_URL}/api/users/v1/refresh-token`, {
        refreshToken,
      }, { withCredentials: true });
      if (response.data.success) {
        dispatch(setCredentials(response.data));
        setShowPopup(false);
        resetTimers();
      }
    } catch (error) {
      console.error("Failed to refresh token", error);
      handleLogout();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    dispatch(logout());
    setShowPopup(false);
    navigate("/");
  };

  const resetTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    const currentToken = token || localStorage.getItem("token");
    if (currentToken) {
      const decoded = parseJwt(currentToken);
      if (decoded && decoded.exp) {
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        // Debug info (development only)
        if (import.meta.env.MODE === "development") {
          console.log(`[Session] Token expires in: ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);
        }

        // Show popup 5 minutes before expiry
        const warningTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);
        
        timerRef.current = setTimeout(() => {
          // Only show popup if tab is visible and user is not active
          // If tab is hidden, we'll check again when it becomes visible
          if (document.visibilityState === "visible") {
            setShowPopup(true);
            setTimeLeft(60);
          }
        }, warningTime);
      }
    }
  };

  // Activity Detection to postpone popup
  useEffect(() => {
    const handleActivity = () => {
      // If popup is already showing, don't reset just on mouse move
      if (showPopup) return;
      
      // Debounce activity reset
      if (window._activityTimeout) return;
      window._activityTimeout = setTimeout(() => {
        window._activityTimeout = null;
        resetTimers();
      }, 30000); // Only reset every 30 seconds of activity
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [showPopup, token]);

  // Sync with Axios refreshes and other tabs
  useEffect(() => {
    const handleRefreshed = (e) => {
      console.log("[Session] Token refreshed externally, resetting timers");
      // If we have detail from CustomEvent, update store
      if (e.detail && e.detail.accessToken) {
        dispatch(setCredentials({
          accessToken: e.detail.accessToken,
          refreshToken: e.detail.refreshToken,
          user: user // Use current user from Redux state
        }));
      }
      resetTimers();
    };

    const handleStorageChange = (e) => {
      if (e.key === "token") {
        console.log("[Session] Token changed in another tab");
        resetTimers();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[Session] Tab became visible, re-checking session");
        resetTimers();
      }
    };

    window.addEventListener("session-refreshed", handleRefreshed);
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("session-refreshed", handleRefreshed);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch, token]);

  useEffect(() => {
    resetTimers();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [token]);

  useEffect(() => {
    if (showPopup) {
      countdownRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showPopup]);

  return (
    <>
      {/* Temporary Test Button (Development Only) */}
      {/* {process.env.NODE_ENV === "development" && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setShowPopup(true);
            setTimeLeft(6);
          }}
          className="fixed bottom-4 right-4 z-[9998] bg-gray-800 text-white px-4 py-2 rounded-full text-xs opacity-50 hover:opacity-100 transition-opacity"
        >
          Test Session Popup
        </button>
      )} */}

      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100 mx-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <FiAlertCircle className="text-blue-600 text-3xl" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Expiring</h2>
                <p className="text-gray-600 mb-8">
                  Your session is about to expire in <span className="font-bold text-blue-600">{timeLeft} seconds</span>. 
                  Would you like to continue?
                </p>

                <div className="flex gap-4 w-full">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 px-6 py-3 cursor-pointer rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Log out
                  </button>
                   <button
                    type="button"
                    onClick={handleContinue}
                    disabled={isRefreshing}
                    className={`flex-1 px-6 py-3 rounded-xl cursor-pointer font-semibold transition-all ${
                      isRefreshing 
                        ? "bg-blue-400 cursor-not-allowed text-white/80" 
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                    }`}
                  >
                    {isRefreshing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Continuing...
                      </span>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SessionTimeoutPopup;

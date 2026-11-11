import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { LogOut, X, ShieldAlert, Sparkles } from "lucide-react";
import getDisplayName from "../../utils/getDisplayName";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const authUser = useSelector((state) => state.auth.user);
  const storedUsername = useSelector((state) => state.auth.username);
  const businessEmail = useSelector((state) => state.auth.businessEmail);
  const role = useSelector(
    (state) => state.auth.role || state.auth.user?.role || state.auth.user?.Role || "User"
  );

  const displayName = getDisplayName(authUser);
  const username = displayName === "Unknown" ? storedUsername || "User" : displayName;
  const email =
    authUser?.businessEmail ||
    authUser?.email ||
    authUser?.Email ||
    businessEmail ||
    "";

  const userInitials = (username || "HT")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Escape key handler & scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop with smooth blur and fade */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-7 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-300 transform scale-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Radial Glow Orbs */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row with Close Button */}
        <div className="flex items-center justify-between pb-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 font-['Outfit']">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            Session Termination
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/5 cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Center Animated Icon Badge */}
        <div className="text-center pt-2 relative z-10">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-rose-500/20 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-rose-500/20 to-red-600/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <LogOut size={26} className="text-rose-400 ml-0.5" />
            </div>
          </div>

          <h3
            id="logout-modal-title"
            className="mt-4 text-xl sm:text-2xl font-extrabold text-white tracking-tight font-['Outfit',sans-serif]"
          >
            Sign Out of HireTrack?
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            Are you sure you want to end your current session? You will need to log back in to access your recruitment workspace.
          </p>
        </div>

        {/* Active Account Identity Chip */}
        {username && (
          <div className="my-5 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm shadow-blue-500/20 font-['Outfit']">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate font-['Outfit']">
                  {username}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-cyan-300 border border-white/10">
                  {role}
                </span>
              </div>
              {email && (
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {email}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-1 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center justify-center gap-2 group"
          >
            <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutModal;

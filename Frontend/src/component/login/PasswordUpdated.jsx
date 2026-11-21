import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";

/**
 * Presentational Component for Password Updated confirmation.
 * Matches executive UI/UX design language of Login & Signup views.
 */
const PasswordUpdated = ({ onLoginClick }) => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    if (onLoginClick) {
      onLoginClick(e);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col items-center text-center py-4 page-card-enter">
      <div className="stagger-item-1 mb-6">
        <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shadow-inner mx-auto">
          <CheckCircle2 size={42} className="animate-pulse" />
        </div>
      </div>

      <div className="stagger-item-2 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Password Reset Complete
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Credentials Updated!
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
          Your account password has been successfully reset. You can now securely sign in to your workspace.
        </p>
      </div>

      <div className="stagger-item-3 w-full max-w-sm mb-4">
        <button
          type="button"
          onClick={handleLogin}
          className="w-full cursor-pointer relative overflow-hidden group bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>Sign In to HireTrack</span>
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform duration-200"
          />
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </button>
      </div>

      <div className="stagger-item-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>End-to-end encrypted session</span>
      </div>
    </div>
  );
};

export default PasswordUpdated;

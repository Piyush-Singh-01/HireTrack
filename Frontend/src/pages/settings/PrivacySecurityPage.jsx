import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DiscardPass from "../../component/setting/DiscardPass";
import { useToast } from "../../utils/ToastContext";
import { useChangePassword } from "../../hooks/auth/usePassChange";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  LockKeyhole,
  KeyRound,
  Info,
} from "lucide-react";

/**
 * PrivacySecurityPage (Route: /privacy)
 * 
 * Main page controller for Privacy & Account Security.
 * Responsibilities:
 * 1. Manages current, new, and confirm password state.
 * 2. Validates fields and triggers password update via useChangePassword.
 * 3. Handles discard confirmation dialog via DiscardPass modal.
 * 4. Logs user out upon successful password reset.
 */
const PrivacySecurityPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const email = localStorage.getItem("businessEmail");

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDiscardPopup, setShowDiscardPopup] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hook for password change mutation
  const { mutate: changePassword, isPending } = useChangePassword();

  // Set document title
  useEffect(() => {
    document.title = "Privacy & Security Settings | Talent OS";
  }, []);

  // Save new password handler
  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("All fields are required", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New password and confirm password do not match", "error");
      return;
    }

    changePassword(
      {
        email,
        currentPassword,
        newPassword,
      },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          localStorage.removeItem("token");
          navigate("/");
          window.location.reload();
        },
      }
    );
  };

  // Discard changes handlers
  const handleDiscardClick = () => {
    if (currentPassword || newPassword || confirmPassword) {
      setShowDiscardPopup(true);
    }
  };

  const handleConfirmDiscard = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowDiscardPopup(false);
  };

  const handleCancelDiscard = () => {
    setShowDiscardPopup(false);
  };

  // Form field definitions for clean mapping
  const passwordFields = [
    {
      label: "Current password",
      value: currentPassword,
      onChange: setCurrentPassword,
      visible: showCurrentPassword,
      onToggle: () => setShowCurrentPassword(!showCurrentPassword),
      placeholder: "Enter your current password",
      autoComplete: "current-password",
    },
    {
      label: "New password",
      value: newPassword,
      onChange: setNewPassword,
      visible: showNewPassword,
      onToggle: () => setShowNewPassword(!showNewPassword),
      placeholder: "Enter your new password",
      autoComplete: "new-password",
    },
    {
      label: "Confirm new password",
      value: confirmPassword,
      onChange: setConfirmPassword,
      visible: showConfirmPassword,
      onToggle: () => setShowConfirmPassword(!showConfirmPassword),
      placeholder: "Re-enter your new password",
      autoComplete: "new-password",
    },
  ];

  return (
    <>
      {/* 1. Breadcrumb navigation */}
      <div className="px-4 pt-5 pb-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Settings
          </span>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-indigo-600">
            Privacy &amp; Security
          </span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        {/* 2. Top Header Banner */}
        <section className="relative isolate mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] via-[#263b83] to-[#4f46a5]  px-5 py-7 text-white shadow-xl shadow-indigo-950/10 sm:px-8 sm:py-9">
          {/* <div className="pointer-events-none absolute -right-14 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" /> */}
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-100 backdrop-blur-sm">
                <ShieldCheck size={15} />
                ACCOUNT SECURITY
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Privacy &amp; Security
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100/80 sm:text-base">
                Keep your account protected by maintaining a secure password and updating it whenever needed.
              </p>
            </div>
            <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/10 shadow-inner backdrop-blur-md sm:flex lg:mr-8">
              <ShieldCheck size={48} strokeWidth={1.35} className="text-indigo-100" />
            </div>
          </div>
        </section>

        {/* 3. Change Password Card */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                <LockKeyhole size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Change password
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Update the password associated with your account.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-7 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
            {/* Password input form */}
            <div className="min-w-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {passwordFields.map((field, index) => (
                  <div
                    key={field.label}
                    className={index === 0 ? "sm:col-span-2" : ""}
                  >
                    <label
                      htmlFor={`password-field-${index}`}
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      {field.label}
                    </label>
                    <div className="group relative">
                      <input
                        id={`password-field-${index}`}
                        type={field.visible ? "text" : "password"}
                        placeholder={field.placeholder}
                        value={field.value}
                        autoComplete={field.autoComplete}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 pr-12 text-sm text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                      <button
                        type="button"
                        onClick={field.onToggle}
                        aria-label={field.visible ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      >
                        {field.visible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {index === 0 && (
                      <p className="mt-2 text-xs text-slate-400">
                        Enter the password you currently use to sign in.
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleDiscardClick}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-500/10 sm:w-auto"
                >
                  Discard changes
                </button>
                <button
                  type="button"
                  onClick={handleSavePassword}
                  disabled={isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl hover:shadow-indigo-600/25 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                >
                  <KeyRound size={17} />
                  {isPending ? "Saving..." : "Save new password"}
                </button>
              </div>
            </div>

            {/* Security guidance side panel */}
            <aside className="h-fit rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80 p-5 sm:p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Keep your account secure
              </h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                A strong, unique password helps protect your account and its information.
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <KeyRound size={12} />
                  </span>
                  <p className="text-xs leading-5 text-slate-600">
                    Use a password that you do not use on other websites.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <LockKeyhole size={12} />
                  </span>
                  <p className="text-xs leading-5 text-slate-600">
                    Avoid sharing your password with anyone.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-3">
                <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-xs leading-5 text-amber-800">
                  Changing your password will log you out of all active sessions.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* 4. Discard confirmation modal */}
        <DiscardPass
          isOpen={showDiscardPopup}
          title="Discard changes?"
          message="Are you sure you want to discard the password changes?"
          onConfirm={handleConfirmDiscard}
          onCancel={handleCancelDiscard}
        />
      </main>
    </>
  );
};

export default PrivacySecurityPage;

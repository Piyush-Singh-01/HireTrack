import React, { useEffect, useState } from "react";
import { UseNotificationSettings } from "../../hooks/useNotificationSettings";
import {
  useCreateNotification,
  useDeleteNotification,
  useUpdateNotification,
} from "../../hooks/settings/useNotification";
import { useToast } from "../../utils/ToastContext";

/**
 * Clean SVG Icon helper for notification channels
 */
const Icon = ({ name, className = "h-5 w-5" }) => {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
        <path d="m9 15 2 2 4-4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" />
        <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.bell}</svg>;
};

/**
 * Reusable toggle switch for enabling/disabling notifications
 */
const ToggleSwitch = ({ checked, onChange, label }) => (
  <label className="inline-flex cursor-pointer items-center" aria-label={label}>
    <input
      type="checkbox"
      className="peer sr-only"
      checked={checked}
      onChange={onChange}
    />
    <span
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-all duration-300 ease-out peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-200 ${
        checked
          ? "bg-indigo-600 shadow-inner shadow-indigo-900/20"
          : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </span>
  </label>
);

/**
 * SettingCard for individual notification channels (Email, Calendar)
 */
const SettingCard = ({
  icon,
  iconTone,
  title,
  description,
  checked,
  onChange,
}) => (
  <div className="group flex min-h-[132px] items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)] sm:p-6">
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconTone} transition-transform duration-300 group-hover:scale-105`}
    >
      <Icon name={icon} className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-bold tracking-tight text-slate-800 sm:text-base">
          {title}
        </h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            checked
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {checked ? "Enabled" : "Off"}
        </span>
      </div>
      <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
        {description}
      </p>
    </div>
    <div className="ml-1 pt-0.5">
      <ToggleSwitch checked={checked} onChange={onChange} label={title} />
    </div>
  </div>
);

/**
 * Dropdown selector for interview reminder timing
 */
const ReminderSelect = ({ label, value, onChange, options, hint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:border-indigo-200 sm:p-5">
    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon name="clock" className="h-4 w-4" />
      </span>
      {label}
    </label>
    <select
      className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition-all duration-200 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      value={value}
      onChange={onChange}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <p className="mt-2 text-xs text-slate-400">{hint}</p>
  </div>
);

/**
 * NotificationsPage (Route: /notification)
 * 
 * Main page controller for user Notification Preferences.
 * Responsibilities:
 * 1. Fetches user notification configuration from backend.
 * 2. Manages email and interview alert toggles.
 * 3. Manages first and second reminder intervals.
 * 4. Saves or updates notification preferences.
 */
const NotificationsPage = () => {
  const userId = localStorage.getItem("userId") || "No user found!";
  const { showToast } = useToast();

  // API hooks
  const {
    data,
    isLoading,
    isError,
    createProfile,
    updateProfile,
  } = UseNotificationSettings(userId);

  // Form state
  const [notification, setNotification] = useState({
    mobilePush: false,
    desktopNotification: false,
    emailNotification: false,
    notifyBeforeInterview: false,
    firstReminder: "",
    secondReminder: "",
  });

  // Set document title
  useEffect(() => {
    document.title = "Notification Preferences | Talent OS";
  }, []);

  // Sync loaded settings to local state
  useEffect(() => {
    if (data?.data) {
      setNotification({
        desktopNotification: data.data.desktopNotification ?? false,
        emailNotification: data.data.emailNotification ?? false,
        notifyBeforeInterview: data.data.notifyBeforeInterview ?? false,
        firstReminder: data.data.firstReminder ?? "",
        secondReminder: data.data.secondReminder ?? "",
      });
    }
  }, [data]);

  // Toggle channel handler
  const handleCheck = (key) => {
    setNotification((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Change reminder value handler
  const handleReminderChange = (key, value) => {
    setNotification((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save changes handler
  const handleSave = () => {
    const payload = {
      desktopNotification: notification.desktopNotification,
      emailNotification: notification.emailNotification,
      notifyBeforeInterview: notification.notifyBeforeInterview,
      firstReminder: notification.firstReminder,
      secondReminder: notification.secondReminder,
    };

    if (data) {
      updateProfile.mutate(payload, {
        onSuccess: (res) => {
          showToast(
            res?.message || "Notification settings updated successfully",
            "success"
          );
        },
        onError: (err) => {
          showToast(
            err?.response?.data?.message ||
              "Failed to update notification settings",
            "error"
          );
        },
      });
    } else {
      createProfile.mutate(payload, {
        onSuccess: (res) => {
          showToast(
            res?.message || "Notification settings created successfully",
            "success"
          );
        },
        onError: (err) => {
          showToast(
            err?.response?.data?.message ||
              "Failed to create notification settings",
            "error"
          );
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-600">
            Loading notification settings...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-4 my-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700 sm:mx-6">
        Failed to load settings
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50/70 pb-8">
      {/* 1. Breadcrumb navigation */}
      <div className="px-4 pb-3 pt-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span className="font-semibold text-slate-400">Settings</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-indigo-700">Notifications</span>
        </div>
      </div>

      <main className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 2. Top Header Banner */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] via-[#263b83] to-[#4f46a5]  px-5 py-7 text-white shadow-[0_18px_45px_rgba(30,41,90,0.18)] sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-12 -top-24 -z-10 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-1/3 -z-10 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-indigo-100 backdrop-blur-sm">
                <Icon name="sparkles" className="h-3.5 w-3.5" />
                PERSONALIZE YOUR ALERTS
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-[34px]">
                Notification Settings
              </h1>
              <p className="mt-2 max-w-xl text-xs leading-6 text-indigo-100/80 sm:text-sm">
                Choose how and when you receive important updates, so you never
                miss an application or an upcoming interview.
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center self-start rounded-2xl border border-white/15 bg-white/10 text-indigo-100 shadow-inner shadow-white/5 backdrop-blur-sm sm:h-20 sm:w-20 sm:self-center">
              <Icon name="bell" className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
          </div>
        </section>

        {/* 3. Notification Channels Section */}
        <section className="mt-7">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                Preferences
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                How would you like to be notified?
              </h2>
            </div>
            <p className="text-xs text-slate-400 sm:text-sm">
              Manage your notification channels
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SettingCard
              icon="mail"
              iconTone="bg-violet-50 text-violet-600"
              title="Email Notifications"
              description="Receive an email whenever your organization receives a new application."
              checked={notification.emailNotification}
              onChange={() => handleCheck("emailNotification")}
            />
            <SettingCard
              icon="calendar"
              iconTone="bg-sky-50 text-sky-600"
              title="Interview Alerts"
              description="Get notified before a scheduled interview so you have time to prepare."
              checked={notification.notifyBeforeInterview}
              onChange={() => handleCheck("notifyBeforeInterview")}
            />
          </div>
        </section>

        {/* 4. Reminder Schedule Configuration */}
        <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_5px_22px_rgba(15,23,42,0.035)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Icon name="clock" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-800 sm:text-lg">
                  Reminder Schedule
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Configure when interview reminders should arrive.
                </p>
              </div>
            </div>
            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                notification.notifyBeforeInterview
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  notification.notifyBeforeInterview
                    ? "bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />
              {notification.notifyBeforeInterview
                ? "Reminders active"
                : "Enable interview alerts to configure"}
            </span>
          </div>

          <div
            className={`relative p-5 transition-all duration-300 sm:p-7 ${
              notification.notifyBeforeInterview
                ? ""
                : "pointer-events-none opacity-45 grayscale-[0.15]"
            }`}
          >
            {!notification.notifyBeforeInterview && (
              <div className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-center sm:flex">
                <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur-sm">
                  Turn on Interview Alerts to edit reminder times
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ReminderSelect
                label="First reminder"
                value={notification.firstReminder}
                onChange={(e) =>
                  handleReminderChange("firstReminder", e.target.value)
                }
                hint="A short reminder before the interview starts."
                options={[
                  { value: "", label: "Select reminder time" },
                  { value: "5", label: "5 minutes before" },
                  { value: "10", label: "10 minutes before" },
                  { value: "15", label: "15 minutes before" },
                  { value: "30", label: "30 minutes before" },
                ]}
              />
              <ReminderSelect
                label="Second reminder"
                value={notification.secondReminder}
                onChange={(e) =>
                  handleReminderChange("secondReminder", e.target.value)
                }
                hint="A second alert to help you plan ahead."
                options={[
                  { value: "", label: "Select reminder time" },
                  { value: "60", label: "1 hour before" },
                  { value: "120", label: "2 hours before" },
                  { value: "1440", label: "1 day before" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* 5. Save Action Bar */}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs text-slate-400 sm:text-left">
            Your preferences will be applied to future notifications.
          </p>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(79,70,229,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-800 hover:via-indigo-700 hover:to-violet-700 hover:shadow-[0_12px_24px_rgba(79,70,229,0.3)] active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-indigo-200 sm:w-auto"
          >
            <span>Save Changes</span>
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;

import React from "react";
import { FiVideo, FiMapPin, FiChevronRight } from "react-icons/fi";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";

export const CHART_COLORS = [
  "#3B82F6", // Electric Blue
  "#8B5CF6", // Purple / Violet
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#F43F5E", // Rose Coral
  "#06B6D4", // Cyan
];

export const STAT_ACCENTS = [
  "from-indigo-500 to-blue-500",
  "from-violet-500 to-purple-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
];

export const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.09)] transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

export const Avatar = ({ name = "?", size = "md" }) => {
  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-base",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue to-indigo-400 text-white font-bold flex items-center justify-center shrink-0 shadow-sm`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
};

export const ModeBadge = ({ mode }) => {
  const isOnline = mode === "Online";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isOnline
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-blue/10 text-blue ring-1 ring-inset ring-blue/20"
      }`}
    >
      {isOnline ? <FiVideo className="text-[12px]" /> : <FiMapPin className="text-[12px]" />}
      {mode || "-"}
    </span>
  );
};

export const EmptyState = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
    <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-xl">
      {icon}
    </div>
    <p className="text-sm font-semibold text-slate-700">{title}</p>
    {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
  </div>
);

export const ModalShell = ({ children, widthClass = "max-w-md" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-6">
    <div
      className={`relative bg-white rounded-2xl shadow-2xl w-full ${widthClass} max-h-[90vh] overflow-y-auto`}
    >
      {children}
    </div>
  </div>
);

export const ModalHeader = ({ eyebrow, title, onClose }) => (
  <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
    <div className="min-w-0">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{eyebrow}</p>
      )}
      <h2 className="text-lg font-bold text-slate-900 truncate">{title}</h2>
    </div>
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="h-8 w-8 shrink-0 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
    >
      <IoMdCloseCircleOutline className="text-xl" />
    </button>
  </div>
);

export const InfoItem = ({ icon, label, children }) => (
  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
    <div className="h-8 w-8 rounded-lg bg-white text-blue shadow-sm flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
      <p className="text-sm font-medium text-slate-800 break-words">{children}</p>
    </div>
  </div>
);

export const GroupMenu = ({ label, icon, applications, onPick, variant = "primary" }) => {
  const buttonTone =
    variant === "danger"
      ? "text-red-600 border-red-200 bg-white hover:bg-red-600 hover:text-white hover:border-red-600"
      : variant === "solid"
      ? "text-white bg-blue border-blue hover:opacity-90"
      : "text-blue border-blue/40 bg-white hover:bg-blue hover:text-white hover:border-blue";

  return (
    <div className="relative group w-full">
      <button
        type="button"
        className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${buttonTone}`}
      >
        {icon}
        {label}
        <FaChevronDown className="text-[10px] transition-transform group-hover:rotate-180" />
      </button>
      <div className="absolute bottom-full left-0 right-0 mb-2 hidden group-hover:block z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-1 max-h-60 overflow-y-auto">
        {applications.map((app, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onPick(app)}
            title={app.name}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 text-left cursor-pointer"
          >
            <Avatar name={app.name} size="xs" />
            <span className="truncate">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const has45MinutesPassedFromSchedule = (row) => {
  const timeValue = row?.time || row?.Time;
  if (!timeValue) return false;

  const timeStr = String(timeValue).trim();
  let hrs, mins;

  if (/am|pm/i.test(timeStr)) {
    const parts = timeStr.split(/\s+/);
    let [h, m] = parts[0].split(":").map(Number);
    const modifier = (parts[1] || "").toLowerCase();
    if (modifier === "pm" && h !== 12) h += 12;
    if (modifier === "am" && h === 12) h = 0;
    hrs = h;
    mins = m;
  } else {
    [hrs, mins] = timeStr.split(":").map(Number);
  }

  if (isNaN(hrs) || isNaN(mins)) return false;

  const now = new Date();
  const interviewDateTime = new Date();
  interviewDateTime.setHours(hrs, mins, 0, 0);

  return (now - interviewDateTime) / (1000 * 60) >= 45;
};

export const formatTimeToAMPM = (time24) => {
  if (!time24) return "-";
  if (/(AM|PM)/i.test(time24)) return time24;
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h === 0 ? 12 : h;
  return `${String(h).padStart(2, "0")}:${m.slice(0, 2)} ${ampm}`;
};

export const getGroupNames = (applicant) => {
  let names = [];
  if (applicant?.allApplications?.length > 0) {
    names = applicant.allApplications.map((a) => a.name || a.fullName || a.candidateName);
  } else if (applicant?.name) {
    names = applicant.name.split(",").map((n) => n.trim()).filter(Boolean);
  }
  if (names.length === 0) return null;
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
};

export const getDisplayName = (item) => {
  if (item.scheduleType === "Group Interview") {
    return getGroupNames(item) || item.name || item.Candidate || "Unknown";
  }
  return item.name || item.Candidate || "Unknown";
};

export const isGroupWithMany = (applicant) =>
  applicant?.scheduleType === "Group Interview" && applicant?.allApplications?.length > 1;

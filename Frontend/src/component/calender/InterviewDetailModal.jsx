import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  Video,
  X,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useToast } from "../../utils/ToastContext";

/**
 * InterviewDetailModal Component
 * 
 * Displays detailed information when a recruiter clicks an interview on the calendar:
 * 1. Candidate Name, Job Position, and Interview Type badge
 * 2. Scheduled Date, Time, and Duration
 * 3. Meeting Mode (Online Video vs In-Person) and Host Recruiter
 * 4. Video Meeting URL with one-click Copy button
 * 5. Direct "Join Video Call" action button
 */
const InterviewDetailModal = ({ event, onClose }) => {
  const { showToast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);

  if (!event) return null;

  const { extendedProps, title, start } = event;
  const meetUrl = event.url || extendedProps?.meetLink;

  // Format date helper: "Tuesday, Nov 10, 2026"
  const formatEventDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time helper: "10:30 AM"
  const formatEventTime = (date, timeStr) => {
    if (timeStr) return timeStr;
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Copy meeting link to clipboard
  const handleCopyLink = (link) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast("Meeting link copied to clipboard!", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white shadow-2xl p-6 sm:p-7 text-slate-900 overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mt-1 pb-4 border-b border-slate-100">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60 mb-1.5">
              <CalendarDays size={12} />
              {extendedProps?.scheduleType || "Interview Session"}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] truncate">
              {extendedProps?.candidateName || title}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Role: <span className="text-slate-800">{extendedProps?.position || "-"}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Interview Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
          {/* Date & Schedule Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
              <Clock size={14} className="text-blue-600" />
              <span>Date &amp; Schedule</span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              {formatEventDate(start)}
            </p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              {formatEventTime(start, extendedProps?.time)} ({extendedProps?.duration || 30} mins)
            </p>
          </div>

          {/* Meeting Mode & Host Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
              <Video size={14} className="text-indigo-600" />
              <span>Meeting Mode</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
              <p className="text-xs font-bold text-slate-900">
                {extendedProps?.mode || "Online Video"}
              </p>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
              Host: {extendedProps?.recruiter || "Recruiter"}
            </p>
          </div>
        </div>

        {/* Video Meeting Link Card */}
        {meetUrl ? (
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/70 mb-5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Video Meeting Link
              </span>
              <button
                type="button"
                onClick={() => handleCopyLink(meetUrl)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                {copiedLink ? (
                  <Check size={12} className="text-emerald-600" />
                ) : (
                  <Copy size={12} />
                )}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-xs font-medium text-slate-700 truncate font-mono">
              {meetUrl}
            </p>
          </div>
        ) : null}

        {/* Modal Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              let link = meetUrl || "https://meet.google.com/new";
              if (typeof link === "string" && link.includes("placeholder")) {
                link = "https://meet.google.com/new";
              }
              window.open(link, "_blank");
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Video size={14} />
            <span>Join Video Call</span>
            <ExternalLink size={12} className="opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetailModal;

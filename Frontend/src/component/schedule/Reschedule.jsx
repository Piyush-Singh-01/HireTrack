import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaRegBell, FaVideo, FaMapMarkerAlt } from "react-icons/fa";
import { useReschedule } from "../../hooks/useReschedule";
import { useToast } from "../../utils/ToastContext";
import { useNotifications } from "../../hooks/useNotifications";
import { MdOutlineCancel } from "react-icons/md";

const Reschedule = ({ interview: propInterview, onCancel, onSuccess, ...props }) => {
  const location = useLocation();
  const interview = propInterview || location.state?.interview;
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("01");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");
  const [mode, setMode] = useState("Online");
  const [duration, setDuration] = useState(30);
  const [sendNotification, setSendNotification] = useState(false);
  const { createReminderMutation } = useNotifications();
  const { mutateAsync: rescheduleInterview, isPending } = useReschedule();
  const { showToast } = useToast();
  const { username } = useSelector((state) => state.auth);

  const toInputDate = (value) => {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const parseTimeSegments = (value) => {
    if (!value) return { h: "01", m: "00", p: "AM" };
    
    // Handle "HH:mm AM/PM"
    const ampmMatch = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (ampmMatch) {
      return { 
        h: ampmMatch[1].padStart(2, "0"), 
        m: ampmMatch[2], 
        p: ampmMatch[3].toUpperCase() 
      };
    }

    // Handle "HH:mm:ss" or "HH:mm" (24h)
    const parts = value.split(":");
    if (parts.length >= 2) {
      let h24 = parseInt(parts[0], 10);
      const m = parts[1].slice(0, 2);
      const p = h24 >= 12 ? "PM" : "AM";
      let h12 = h24 % 12;
      h12 = h12 === 0 ? 12 : h12;
      return { h: String(h12).padStart(2, "0"), m, p };
    }

    return { h: "01", m: "00", p: "AM" };
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  useEffect(() => {
    if (interview) {
      setDate(toInputDate(interview.date));
      const { h, m, p } = parseTimeSegments(interview.time);
      setHour(h);
      setMinute(m);
      setPeriod(p);
      const incomingMode = String(interview.meetingMode || interview.mode || "Online").toLowerCase();
      setMode(incomingMode === "offline" ? "Offline" : "Online");
      setDuration(30);
      setSendNotification(false);
    }
  }, [interview?._id]);

  const handleSubmit = async () => {
    if (!interview) return;

    const jobId =
      interview.jobId || interview.positionId || interview.job_id;

    const cId = interview.candidateId || interview.applicationId || interview.id || interview._id;

    const scheduleId = interview.scheduleId || interview._id;
    const candidateDetailsId = interview.candidateDetailsId || interview.candidateDetails?._id;

    if (!jobId || !cId) {
      showToast("Required IDs missing", "error");
      return;
    }

    try {
      showToast(scheduleId && candidateDetailsId && scheduleId !== cId ? "Rescheduling interview..." : "Scheduling interview...", "info");

      const res = await rescheduleInterview({
        jobId,
        scheduleId,
        candidateDetailsId,
        newDate: date,
        newTime: `${hour}:${minute} ${period}`,
        meetingMode: mode,
        durationMinutes: Number(duration),
        sendNotification,
        candidateId: cId,
        recruiterName: interview.recruiter || interview.recruiterName,
        applicant: interview.applicant || interview.name,
        scheduleType: interview.scheduleType || "Interview",
      });

      // if (sendNotification) {
      //   await createReminderMutation.mutateAsync({
      //     title: "Interview Rescheduled",
      //     message: `Interview with ${interview.name} for ${interview.position} is rescheduled to ${date} at ${time}`,
      //     date,
      //     time,
      //     type: "interview",
      //     relatedId: scheduleId,
      //   });
      // }

      showToast(res?.message || "Interview rescheduled successfully!", "success");
      onSuccess?.();
    } catch (err) {
      console.error("Reschedule failed:", err);
      showToast("Failed to reschedule interview", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[88vh] w-full max-w-[680px] overflow-y-auto rounded-2xl border border-white/70 bg-white shadow-[0_20px_60px_-18px_rgba(15,23,42,0.45)]"
      >
        {/* Compact header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-5 py-4 text-white sm:px-6">
          <div className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 sm:flex">
                <FaCalendarAlt className="text-lg" />
              </div>
              <div className="min-w-0">
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100">
                  Interview management
                </p>
                <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                  {interview?.scheduleType === "Group Interview" ? "GD Rescheduling" : "Interview Rescheduling"}
                </h2>
                <p className="mt-0.5 text-[13px] text-indigo-100">
                  Update the date, time and meeting details.
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close reschedule modal"
              onClick={onCancel}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20"
            >
              <MdOutlineCancel className="text-xl" />
            </button>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-5">
          {/* Compact interview summary */}
          <div className="mb-5 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 to-violet-50/70 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              <h3 className="text-[13px] font-bold text-slate-800">Interview details</h3>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              <div className="min-w-0">
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Candidate</p>
                <p className="break-words text-[13px] font-semibold text-slate-800">
                  {interview?.candidateNames?.length > 0
                    ? interview.candidateNames.join(", ")
                    : interview?.name || "-"}
                </p>
              </div>
              <div className="min-w-0 sm:border-l sm:border-indigo-100 sm:pl-3">
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Position</p>
                <p className="break-words text-[13px] font-semibold text-slate-800">
                  {interview?.position || "-"}
                </p>
              </div>
              <div className="min-w-0 sm:border-l sm:border-indigo-100 sm:pl-3">
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Recruiter</p>
                <p className="break-words text-[13px] font-semibold text-slate-800">
                  {interview?.recruiter && interview.recruiter !== "Unknown" ? interview.recruiter : (username || "HR")}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule fields */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">New schedule</h3>
              <p className="mt-0.5 text-xs text-slate-500">Select when and how the interview will take place.</p>
            </div>
            <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
              Required details
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Date */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Interview date</label>
              <div className="flex h-10 items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
                <FaCalendarAlt className="shrink-0 text-sm text-indigo-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full min-w-0 cursor-pointer bg-transparent text-[13px] font-medium text-slate-700 outline-none"
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Interview time</label>
              <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
                <FaClock className="shrink-0 text-sm text-indigo-500" />
                <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
                  <select
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    aria-label="Hour"
                    className="min-w-0 cursor-pointer rounded-md bg-transparent px-1 py-1 text-[13px] font-semibold text-slate-700 outline-none"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="text-[13px] font-bold text-slate-400">:</span>
                  <select
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    aria-label="Minute"
                    className="min-w-0 cursor-pointer rounded-md bg-transparent px-1 py-1 text-[13px] font-semibold text-slate-700 outline-none"
                  >
                    {minutes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    aria-label="AM or PM"
                    className="cursor-pointer rounded-md bg-transparent px-1 py-1 text-[13px] font-bold text-indigo-700 outline-none"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Meeting mode */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Meeting mode</label>
              <div className="grid h-10 grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("Online")}
                  aria-pressed={mode === "Online"}
                  className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold transition-all duration-200 ${
                    mode === "Online"
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  <FaVideo />
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setMode("Offline")}
                  aria-pressed={mode === "Offline"}
                  className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold transition-all duration-200 ${
                    mode === "Offline"
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  <FaMapMarkerAlt />
                  Offline
                </button>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Interview duration</label>
              <div className="flex h-10 items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-[13px] text-indigo-600">
                  <FaRegBell />
                </span>
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  aria-label="Duration in minutes"
                  className="w-full bg-transparent text-[13px] font-semibold text-slate-800 outline-none"
                />
                <span className="whitespace-nowrap text-xs font-medium text-slate-500">Minutes</span>
              </div>
            </div>
          </div>

          {/* Notification */}
          <label className="mt-4 flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/50">
            <input
              type="checkbox"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-indigo-600"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-slate-800">Send notification</span>
              <span className="block text-[11px] text-slate-500">Notify the candidate about the schedule update.</span>
            </span>
            <FaRegBell className="shrink-0 text-sm text-indigo-400" />
          </label>

          {/* Actions */}
          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg ${
                isPending ? "cursor-not-allowed opacity-60 hover:translate-y-0" : ""
              }`}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Reschedule;

import React, { useState, useMemo } from "react";
import { 
  X, 
  Filter, 
  Edit3, 
  Calendar, 
  Clock, 
  Video, 
  UserCheck, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  User,
  Briefcase
} from "lucide-react";
import { normalizeScheduleRecord } from "../../hooks/useNormalizedSchedules";
import { useNavigate } from "react-router-dom";
import ReschedulePopup from "./ReschedulePopup";

function SchedulePopup({
  isOpen,
  onClose,
  selectedUserId,
  getusers,
  selectedUserName,
  schedules,
}) {
  if (!isOpen) return null;

  const [reschedule, setReschedule] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [dateFilter, setDateFilter] = useState("Today");
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterPosition, setFilterPosition] = useState("All Position");
  const [filterStatus, setFilterStatus] = useState("All Status");

  const navigate = useNavigate();

  const normalizedSchedules = useMemo(() => {
    if (!Array.isArray(schedules)) return [];
    return schedules.map(normalizeScheduleRecord);
  }, [schedules]);

  const uniquePositions = useMemo(() => {
    const positions = normalizedSchedules
      .filter((item) => item.recruiter === selectedUserName)
      .map((item) => item.position)
      .filter(Boolean);
    return ["All Position", ...new Set(positions)];
  }, [normalizedSchedules, selectedUserName]);

  const uniqueStatuses = useMemo(() => {
    const statuses = normalizedSchedules
      .filter((item) => item.recruiter === selectedUserName)
      .map((item) => item.status)
      .filter(Boolean);
    return ["All Status", ...new Set(statuses)];
  }, [normalizedSchedules, selectedUserName]);

  // ================= DATE HELPERS =================
  const parseDateString = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const isMissedByTime = (interview) => {
    const interviewDate = parseDateString(interview.date);
    if (!interviewDate || !interview.time) return false;

    let timeStr = interview.time.toUpperCase().replace(/(AM|PM)/, " $1");
    let [time, modifier] = timeStr.split(" ");
    let [h, m] = time.split(":").map(Number);

    if (modifier === "PM" && h !== 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;

    const scheduled = new Date(interviewDate);
    scheduled.setHours(h, m, 0, 0);

    const diff = (new Date() - scheduled) / (1000 * 60);
    return diff > 15;
  };

  const canStartInterview = (interview) => {
    const interviewDate = parseDateString(interview.date);
    if (!interviewDate || !interview.time) return false;

    let timeStr = interview.time.toUpperCase().replace(/(AM|PM)/, " $1");
    let [time, modifier] = timeStr.split(" ");
    let [h, m] = time.split(":").map(Number);

    if (modifier === "PM" && h !== 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;

    const scheduled = new Date(interviewDate);
    scheduled.setHours(h, m, 0, 0);

    const diff = (new Date() - scheduled) / (1000 * 60);
    return diff >= -15 && diff <= 15;
  };

  // ================= START INTERVIEW =================
  const openStartConfirm = (interview) => {
    setSelectedInterview(interview);
    setShowStartConfirm(true);
  };

  const confirmStartInterview = async () => {
    let link =
      selectedInterview?.meetLink ||
      selectedInterview?.meetingLink ||
      "https://meet.google.com/new";

    if (typeof link === "string" && link.includes("placeholder")) {
      link = "https://meet.google.com/new";
    }

    try {
      await navigator.clipboard.writeText(link);
    } catch {}

    window.open(link, "_blank");
    setShowStartConfirm(false);
  };

  // ================= FILTER =================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const userResponse = normalizedSchedules
    .filter((item) => item.recruiter === selectedUserName)
    // DATE FILTER (Today/Tomorrow)
    .filter((item) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);

      if (dateFilter === "Today") return itemDate.toDateString() === today.toDateString();
      if (dateFilter === "Tomorrow") return itemDate.getTime() === tomorrow.getTime();
      return true;
    })
    // POSITION FILTER
    .filter((item) =>
      filterPosition === "All Position"
        ? true
        : item.position === filterPosition
    )
    // STATUS FILTER
    .filter((item) =>
      filterStatus === "All Status"
        ? true
        : (item.status || "").toLowerCase() === filterStatus.toLowerCase()
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* ===== START CONFIRMATION MODAL ===== */}
      {showStartConfirm && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 p-5 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Video size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">Start Interview?</h4>
            <p className="text-xs text-slate-500 mb-4">
              You will be redirected to the meeting link. The meeting URL will also be copied to your clipboard.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setShowStartConfirm(false)}
                className="w-full py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmStartInterview}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Start Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN POPUP CONTAINER ===== */}
      <div
        className="relative my-auto w-full max-w-5xl rounded-xl border border-white/70 bg-white shadow-2xl overflow-hidden font-inter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg text-white">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">
                Recruiter Schedule
              </p>
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                {selectedUserName ? `${selectedUserName}'s Schedule` : "Interview Schedules"}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          {/* Quick Date Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">View:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs">
              {["Today", "Tomorrow"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDateFilter(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                    dateFilter === tab
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
          >
            <Filter size={14} className="text-slate-500" />
            <span>Filter / Sort</span>
          </button>
        </div>

        {/* Schedule Table */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto">
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Position</th>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Recruiter</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4 text-center">Status / Action</th>
                    <th className="py-3 px-4 text-center">Reschedule</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {userResponse.length > 0 ? (
                    userResponse.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition">
                        {/* Date & Time */}
                        <td className="py-3 px-4 font-medium text-slate-800">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Clock size={13} className="text-slate-400 shrink-0" />
                            <span>{new Date(item.date).toLocaleDateString()} • {item.time}</span>
                          </div>
                        </td>

                        {/* Position */}
                        <td className="py-3 px-4 text-slate-600">
                          <span className="font-semibold text-slate-700">{item.position}</span>
                        </td>

                        {/* Candidate */}
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {item.name}
                        </td>

                        {/* Recruiter */}
                        <td className="py-3 px-4 text-slate-600">
                          {item.recruiter}
                        </td>

                        {/* Mode */}
                        <td className="py-3 px-4 text-slate-600">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
                            {item.mode}
                          </span>
                        </td>

                        {/* Action / Status */}
                        <td className="py-3 px-4 text-center">
                          {["rejected"].includes((item.status || "").toLowerCase()) ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                              <XCircle size={12} />
                              Rejected
                            </span>
                          ) : ["hired"].includes((item.status || "").toLowerCase()) ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <UserCheck size={12} />
                              Hired
                            </span>
                          ) : ["onhold", "on hold", "on-wait", "on wait", "onwait"].includes((item.status || "").toLowerCase()) ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                              <Clock size={12} />
                              On-Wait
                            </span>
                          ) : item.status === "rescheduled" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                              Rescheduled
                            </span>
                          ) : item.status === "completed" || isMissedByTime(item) ? (
                            <button
                              onClick={() =>
                                navigate("/schedule_Feedback_Post", {
                                  state: {
                                    jobId: item.jobId,
                                    candidate: item,
                                    showFeedback: true,
                                  },
                                })
                              }
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold hover:underline cursor-pointer"
                            >
                              <span>View Details</span>
                              <ExternalLink size={12} />
                            </button>
                          ) : canStartInterview(item) ? (
                            <button
                              onClick={() => openStartConfirm(item)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                            >
                              <Video size={13} />
                              <span>Start</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 font-medium">
                              Not Started
                            </span>
                          )}
                        </td>

                        {/* Reschedule */}
                        <td className="py-3 px-4 text-center">
                          {[
                            "hired",
                            "rejected",
                            "onhold",
                            "on hold",
                            "on-wait",
                            "on wait",
                            "onwait",
                          ].includes((item.status || "").toLowerCase()) ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedInterview(item);
                                setReschedule(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition cursor-pointer"
                              title="Reschedule Interview"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <AlertCircle size={24} className="text-slate-300" />
                          <p className="font-semibold text-slate-600">No interviews found</p>
                          <p className="text-[11px] text-slate-400">There are no scheduled interviews for the selected date or filter criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Reschedule Popup Component */}
      <ReschedulePopup
        isOpen={reschedule}
        interview={selectedInterview}
        onClose={() => {
          setReschedule(false);
          setSelectedInterview(null);
        }}
      />

      {/* ===== FILTER / SORT DRAWER MODAL ===== */}
      {showFilterModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4"
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 p-5 animate-in fade-in zoom-in-95 font-inter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Filter Schedules</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 mb-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Position
                </label>
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {uniquePositions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "hired"
                        ? "Hired"
                        : status === "onhold"
                        ? "On Hold"
                        : status === "rejected"
                        ? "Rejected"
                        : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setFilterPosition("All Position");
                  setFilterStatus("All Status");
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchedulePopup;
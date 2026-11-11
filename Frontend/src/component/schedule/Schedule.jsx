import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaFilter, FaEdit } from "react-icons/fa";
import { useSchedules, useRejectInterview } from "../../hooks/useSchedule";
import Reschedule from "./Reschedule";
import rescheduleicon from "../../assets/schedule/rescheduleicon.png";
import ViewDetailsPopup from "./ViewDetailsPopup";
import useNormalizedSchedules from "../../hooks/useNormalizedSchedules";
import { useToast } from "../../utils/ToastContext";
import usePositions from "../../hooks/usePosition";
import useAuth from "../../hooks/useAuth";
import { LuArrowUpDown } from "react-icons/lu";
import ScheduleFilterModal from "./ScheduleFilterModal";

const Schedule = ({ initialDate = "Today", initialTab = "All", ...props }) => {
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterPosition, setFilterPosition] = useState("All Position");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCalendarFrom, setShowCalendarFrom] = useState(false);
  const [showCalendarTo, setShowCalendarTo] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [showViewDetailsPopup, setShowViewDetailsPopup] = useState(false);
  const [viewDetailsInterview, setViewDetailsInterview] = useState(null);
  const [localSchedules, setLocalSchedules] = useState([]);
  const { mutateAsync: rejectInterview } = useRejectInterview();
  const [appliedPosition, setAppliedPosition] = useState("All Position");
  const [appliedStatus, setAppliedStatus] = useState("All Status");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: "date", order: "asc" });
  const [openSortMenu, setOpenSortMenu] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleCheckboxChange = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Add CSS for webkit browsers to hide scrollbar
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const handleOutsideSortMenuClick = (event) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest("[data-sort-menu]")) {
        setOpenSortMenu(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideSortMenuClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideSortMenuClick);
    };
  }, []);

  // Fetch from API based on current filters
  const mapSelectedDateToType = (label) => {
    if (label === "Today") return "today";
    if (label === "Yesterday") return "yesterday";
    if (label === "Tomorrow") return "tomorrow";
    if (label === "All") return undefined;
  };

  const { user } = useAuth();

  const userId = user?._id || localStorage.getItem("userId");

  const {
    data: normalizedSchedules = [],
    isLoading,
    isError,
  } = useNormalizedSchedules(userId, {
    type: mapSelectedDateToType(selectedDate),
    status: appliedStatus === "All Status" ? undefined : appliedStatus,
    position: appliedPosition === "All Position" ? undefined : appliedPosition,
  });

  // Debug: Log schedules received by Schedule component
  console.log("DEBUG: Schedule component received:", {
    selectedDate,
    normalizedSchedulesCount: normalizedSchedules.length,
    normalizedSchedules: normalizedSchedules.slice(0, 3),
    isLoading,
    isError,
  });
  const { positions: allJobs } = usePositions("All");

  const positionOptions = React.useMemo(() => {
    const jobTitles = allJobs
      .map((j) => (j.jobTitle || j.title)?.trim())
      .filter(Boolean);

    const scheduleTitles = normalizedSchedules
      .map((s) => s.position?.trim())
      .filter(Boolean);

    return [...new Set([...jobTitles, ...scheduleTitles])].sort();
  }, [allJobs, normalizedSchedules]);

  const parseDateString = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;

    if (typeof value === "string" && value.includes("T")) {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [yyyy, mm, dd] = value.split("-").map(Number);
      return new Date(yyyy, mm - 1, dd);
    }

    if (
      typeof value === "string" &&
      /^\d{2}[-\/]\d{2}[-\/]\d{4}$/.test(value)
    ) {
      const [dd, mm, yyyy] = value.split(/[-\/]/).map(Number);
      return new Date(yyyy, mm - 1, dd);
    }

    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const normalizeStatusText = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[\s_-]+/g, "");

  const getCanonicalStatus = (interview) => {
    const raw = normalizeStatusText(interview?.status);
    const isRescheduledFlag = Boolean(
      interview?.reschedule ?? interview?.Reschedule,
    );

    if (raw === "hired") return "hired";
    if (raw === "rejected") return "rejected";
    if (raw === "onhold" || raw === "onwait") return "onhold";
    if (raw === "completed") return "completed";
    if (raw === "rescheduled" || isRescheduledFlag) return "rescheduled";

    if (
      raw === "interview" ||
      raw === "scheduled" ||
      raw === "upcoming" ||
      raw === "startinterview" ||
      raw === "incomplete"
    ) {
      return "schedule";
    }

    return raw;
  };

  const isWithinRange = (d, from, to) => {
    if (!d) return false;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  };

  const isSameDay = (dateA, dateB) => {
    return (
      dateA &&
      dateB &&
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  useEffect(() => {
    setLocalSchedules(normalizedSchedules);
  }, [normalizedSchedules]);

  const getFilteredInterviews = () => {
    let rows = localSchedules;

    if (appliedPosition && appliedPosition !== "All Position") {
      rows = rows.filter(
        (interview) =>
          (interview.position || "").toLowerCase().trim() ===
          appliedPosition.toLowerCase().trim(),
      );
    }

    if (appliedStatus && appliedStatus !== "All Status") {
      rows = rows.filter((interview) => {
        const canonical = getCanonicalStatus(interview);
        const wanted = normalizeStatusText(appliedStatus);

        if (["schedule", "scheduled", "interview"].includes(wanted)) {
          return canonical === "schedule";
        }

        if (["reschedule", "rescheduled"].includes(wanted)) {
          return canonical === "rescheduled";
        }

        if (["onhold", "onwait"].includes(wanted)) {
          return canonical === "onhold";
        }

        if (wanted === "completed") {
          return canonical === "completed";
        }

        return canonical === wanted;
      });
    }

    if (appliedDateFrom || appliedDateTo) {
      const from = parseDateString(appliedDateFrom);
      const to = parseDateString(appliedDateTo);

      if (from) from.setHours(0, 0, 0, 0);
      if (to) to.setHours(23, 59, 59, 999);

      rows = rows.filter((interview) => {
        const d = parseDateString(interview.date);
        if (!d) return false;
        return isWithinRange(d, from, to);
      });
    } else {
      if (selectedDate !== "All") {
        const targetDay =
          selectedDate === "Today"
            ? today
            : selectedDate === "Yesterday"
              ? yesterday
              : selectedDate === "Tomorrow"
                ? tomorrow
                : null;

        if (targetDay) {
          rows = rows.filter((interview) =>
            isSameDay(parseDateString(interview.date), targetDay),
          );
        }
      }
    }

    return rows;
  };

  const getTimeInMinutes = (value) => {
    if (!value) return null;
    let timeStr = String(value).trim().toUpperCase();

    if (/AM|PM/.test(timeStr) && !timeStr.includes(" ")) {
      timeStr = timeStr.replace(/(AM|PM)/, " $1");
    }

    if (/AM|PM/.test(timeStr)) {
      const [time, modifier] = timeStr.split(" ");
      let [h, m] = time.split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      if (modifier === "PM" && h !== 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;
      return h * 60 + m;
    }

    const [h, m] = timeStr.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const sortInterviews = (rows) => {
    if (!Array.isArray(rows) || !sortConfig.field) return rows;

    return [...rows].sort((a, b) => {
      let comparison = 0;

      if (sortConfig.field === "date") {
        const aDate = parseDateString(a?.date)?.getTime() ?? 0;
        const bDate = parseDateString(b?.date)?.getTime() ?? 0;
        comparison = aDate - bDate;
      } else if (sortConfig.field === "time") {
        const aTime = getTimeInMinutes(a?.time) ?? 0;
        const bTime = getTimeInMinutes(b?.time) ?? 0;
        comparison = aTime - bTime;
      }

      if (comparison === 0) {
        const fallbackDate =
          (parseDateString(a?.date)?.getTime() ?? 0) -
          (parseDateString(b?.date)?.getTime() ?? 0);
        if (fallbackDate !== 0) return fallbackDate;

        const fallbackTime =
          (getTimeInMinutes(a?.time) ?? 0) - (getTimeInMinutes(b?.time) ?? 0);
        return fallbackTime;
      }

      return sortConfig.order === "asc" ? comparison : -comparison;
    });
  };

  const toggleSort = (field) => {
    if (sortConfig.field !== field) {
      setSortConfig({ field, order: "asc" });
    } else {
      setSortConfig({
        field,
        order: sortConfig.order === "asc" ? "desc" : "asc",
      });
    }
  };

  const renderSortHeader = (field, label) => {
    const isActive = sortConfig.field === field;

    return (
      <div className="relative inline-flex items-center gap-1.5">
        <span>{label}</span>
        <button
          type="button"
          onClick={() => toggleSort(field)}
          className="inline-flex cursor-pointer items-center p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={`Sort ${label}`}
        >
          <LuArrowUpDown
            className={`w-3.5 h-3.5 ${isActive ? "text-amber-300 font-bold" : "text-white/70"}`}
          />
        </button>
        {isActive && (
          <span className="text-[9px] px-1.5 py-0.5 uppercase rounded bg-white/20 text-white font-bold">
            {sortConfig.order === "asc" ? "ASC" : "DESC"}
          </span>
        )}
      </div>
    );
  };

  const isMissedByTime = (interview) => {
    const interviewDate = parseDateString(interview.date);
    if (!interviewDate || !interview.time) return false;

    let timeStr = interview.time.trim().toUpperCase();

    if (/AM|PM/.test(timeStr) && !timeStr.includes(" ")) {
      timeStr = timeStr.replace(/(AM|PM)/, " $1");
    }

    let hours = 0;
    let minutes = 0;

    if (/AM|PM/.test(timeStr)) {
      const [time, modifier] = timeStr.split(" ");
      let [h, m] = time.split(":").map(Number);
      if (modifier === "PM" && h !== 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;
      hours = h;
      minutes = m;
    } else {
      [hours, minutes] = timeStr.split(":").map(Number);
    }

    const scheduledDateTime = new Date(interviewDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffInMinutes = (now - scheduledDateTime) / (1000 * 60);

    return diffInMinutes > 15;
  };

  const canStartInterview = (interview) => {
    const interviewDate = parseDateString(interview.date);
    if (!interviewDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const interviewDay = new Date(interviewDate);
    interviewDay.setHours(0, 0, 0, 0);

    return interviewDay <= today;
  };

  const isUpcomingByTime = (interview) => {
    const interviewDate = parseDateString(interview.date);
    if (!interviewDate || !interview.time) return false;

    let timeStr = interview.time.trim().toUpperCase();

    if (/AM|PM/.test(timeStr) && !timeStr.includes(" ")) {
      timeStr = timeStr.replace(/(AM|PM)/, " $1");
    }

    let hours = 0;
    let minutes = 0;

    if (/AM|PM/.test(timeStr)) {
      const [time, modifier] = timeStr.split(" ");
      let [h, m] = time.split(":").map(Number);

      if (modifier === "PM" && h !== 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;

      hours = h;
      minutes = m;
    } else {
      [hours, minutes] = timeStr.split(":").map(Number);
    }

    const scheduledDateTime = new Date(interviewDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    return new Date() < scheduledDateTime;
  };

  const getTabFilteredInterviews = () => {
    const base = filteredInterviews;

    switch (activeTab) {
      case "All":
        return base;

      case "Missed Out":
        return base.filter(
          (i) =>
            ![
              "hired",
              "rejected",
              "completed",
              "onhold",
              "on hold",
              "on-wait",
              "on wait",
              "onwait",
            ].includes((i.status || "").toLowerCase()) && isMissedByTime(i),
        );

      case "Completed":
        return base.filter((i) =>
          [
            "completed",
            "hired",
            "rejected",
            "onhold",
            "on hold",
            "on-wait",
            "on wait",
            "onwait",
          ].includes((i.status || "").toLowerCase()),
        );

      case "Upcoming":
      case "Upcomming":
        return base.filter(
          (i) =>
            ![
              "hired",
              "rejected",
              "completed",
              "onhold",
              "on hold",
              "on-wait",
              "on wait",
              "onwait",
            ].includes((i.status || "").toLowerCase()) && isUpcomingByTime(i),
        );

      default:
        return base;
    }
  };

  const filteredInterviews = getFilteredInterviews();
  const tabFilteredInterviews = getTabFilteredInterviews();
  const sortedFilteredInterviews = sortInterviews(filteredInterviews);
  const sortedTabFilteredInterviews = sortInterviews(tabFilteredInterviews);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDateDropdown(false);
  };

  const handleApplyFilter = () => {
    setAppliedPosition(filterPosition);
    setAppliedStatus(filterStatus);
    setAppliedDateFrom(filterDateFrom);
    setAppliedDateTo(filterDateTo);

    if (filterDateFrom || filterDateTo) {
      setSelectedDate("All");
    }

    setShowFilterModal(false);
  };

  const handleCancelFilter = () => {
    setShowFilterModal(false);
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatTimeToAMPM = (time24) => {
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

  const handleCalendarDateSelect = (date, isFrom) => {
    if (isFrom) {
      setFilterDateFrom(formatDate(date));
      setShowCalendarFrom(false);
    } else {
      setFilterDateTo(formatDate(date));
      setShowCalendarTo(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "next") {
        newMonth.setMonth(prev.getMonth() + 1);
      } else {
        newMonth.setMonth(prev.getMonth() - 1);
      }
      return newMonth;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const openStartConfirm = (interview) => {
    setSelectedInterview(interview || null);
    setShowStartConfirm(true);
  };

  const closeStartConfirm = () => {
    setShowStartConfirm(false);
    setSelectedInterview(null);
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
      showToast("Meeting link copied to clipboard", "success");
    } catch (err) {}

    setLocalSchedules((prev) =>
      prev.map((item) =>
        item._id === selectedInterview._id
          ? { ...item, status: "completed", started: true }
          : item,
      ),
    );

    window.open(link, "_blank", "noopener,noreferrer");
    setShowStartConfirm(false);
  };

  const openReschedule = (interview) => {
    setSelectedInterview(interview || null);
    setShowRescheduleModal(true);
  };

  const closeReschedule = () => {
    setShowRescheduleModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-slate-800 font-bold";
      case "Upcoming":
        return "text-slate-800 font-bold";
      case "Incomplete":
        return "text-slate-600 font-bold";
      default:
        return "text-slate-600 font-bold";
    }
  };

  const renderStatusPill = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "hired") {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-sm">
          Hired
        </span>
      );
    }
    if (["onhold", "on hold", "on-wait", "on wait", "onwait"].includes(s)) {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-sm">
          On-Wait
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-sm">
          Rejected
        </span>
      );
    }
    return <span className="text-slate-800 font-bold">{status}</span>;
  };

  const openViewDetails = (interview) => {
    setViewDetailsInterview(interview);
    setShowViewDetailsPopup(true);
  };

  const closeViewDetails = () => {
    setShowViewDetailsPopup(false);
    setViewDetailsInterview(null);
  };

  const appliedFilters = [];

  if (appliedPosition !== "All Position") {
    appliedFilters.push({
      label: `Position: ${appliedPosition}`,
      onRemove: () => {
        setAppliedPosition("All Position");
        setFilterPosition("All Position");
      },
    });
  }

  if (appliedStatus !== "All Status") {
    appliedFilters.push({
      label: `Status: ${appliedStatus}`,
      onRemove: () => {
        setAppliedStatus("All Status");
        setFilterStatus("All Status");
      },
    });
  }

  if (appliedDateFrom || appliedDateTo) {
    appliedFilters.push({
      label: `Date: ${appliedDateFrom || "..."} → ${appliedDateTo || "..."}`,
      onRemove: () => {
        setAppliedDateFrom("");
        setAppliedDateTo("");
        setFilterDateFrom("");
        setFilterDateTo("");
        setSelectedDate("All");
      },
    });
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-slate-50/70 text-slate-800">
      {/* Top confirmation modal for starting interview */}
      {showStartConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-slate-900/40 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-7 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Start Interview
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you ready to start this interview session? The meeting link will be copied to your clipboard.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeStartConfirm}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                No
              </button>
              <button
                onClick={confirmStartInterview}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-500/20"
              >
                Yes, Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Schedule
          </h1>
          <div className="relative">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
              onClick={() => setShowDateDropdown(!showDateDropdown)}
            >
              <span className="text-xs sm:text-sm text-slate-700 font-bold">
                {selectedDate}
              </span>
              <FaChevronDown
                className={`text-slate-400 text-xs transition-transform duration-200 ${
                  showDateDropdown ? "rotate-180" : ""
                }`}
              />
            </div>
            {showDateDropdown && (
              <div className="absolute left-0 mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden p-1.5 animate-in fade-in zoom-in duration-150">
                {["All", "Yesterday", "Today", "Tomorrow"]
                  .filter((d) => d !== selectedDate)
                  .map((d) => (
                    <div
                      key={d}
                      onClick={() => handleDateSelect(d)}
                      className="px-3.5 py-2.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 font-bold cursor-pointer text-xs sm:text-sm text-slate-600 transition-colors"
                    >
                      {d}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs & Sort Toolbar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* LEFT: Segmented Tabs (for Today / All) */}
        {selectedDate === "Today" || selectedDate === "All" ? (
          <div className="flex flex-wrap gap-2 items-center bg-slate-200/60 p-1.5 rounded-2xl">
            {["All", "Missed Out", "Completed", "Upcomming"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedRows([]);
                }}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
            {activeTab === "Upcomming" && selectedRows.length > 0 && (
              <button
                className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
                onClick={() => {
                  const firstSelected = tabFilteredInterviews.find(
                    (i) => selectedRows.includes(i._id || i.scheduleId)
                  );
                  if (firstSelected) {
                    setSelectedInterview(firstSelected);
                    setShowRescheduleModal(true);
                  }
                }}
              >
                Reschedule GD
              </button>
            )}
          </div>
        ) : (
          <div />
        )}

        {/* RIGHT: Applied Chips & Sort Button */}
        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          {appliedFilters.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {appliedFilters.map((filter, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 shadow-sm"
                >
                  {filter.label}
                  <button
                    onClick={filter.onRemove}
                    className="text-xs font-black hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-slate-300 transition-colors cursor-pointer text-xs sm:text-sm font-bold text-slate-700"
            onClick={() => setShowFilterModal(true)}
          >
            <span>Sort & Filter</span>
            <FaFilter className="text-indigo-600 w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interviews Table Container */}
      {(selectedDate === "Today" || selectedDate === "All") && (
        <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead className="bg-indigo-700 text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-4 px-6">
                    {renderSortHeader("date", "Date")}
                  </th>
                  <th className="py-4 px-6">
                    {renderSortHeader("time", "Time")}
                  </th>
                  <th className="py-4 px-6">Position</th>
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-6">Recruiter</th>
                  <th className="py-4 px-6">Mode</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">
                    {activeTab === "Completed" ? "Feedback" : "Reschedule"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                {sortedTabFilteredInterviews.map((interview, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {new Date(interview.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {formatTimeToAMPM(interview.time)}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {interview.position || "-"}
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-semibold">
                      {interview.candidateName || interview.name || "-"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {interview.recruiterName || interview.interviewer || "-"}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {interview.mode || "Online"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => openStartConfirm(interview)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition-colors"
                      >
                        Start / View
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => openReschedule(interview)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                        title="Reschedule Interview"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {sortedTabFilteredInterviews.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      No interviews scheduled for this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reschedule Modal Integration */}
      {showRescheduleModal && (
        <Reschedule
          isOpen={showRescheduleModal}
          onClose={closeReschedule}
          interview={selectedInterview}
        />
      )}

      {/* View Details Popup Integration */}
      {showViewDetailsPopup && (
        <ViewDetailsPopup
          isOpen={showViewDetailsPopup}
          onClose={closeViewDetails}
          interview={viewDetailsInterview}
        />
      )}

      {/* Filter / Sort Modal */}
      <ScheduleFilterModal
        isOpen={showFilterModal}
        onClose={handleCancelFilter}
        onApply={handleApplyFilter}
        filterPosition={filterPosition}
        setFilterPosition={setFilterPosition}
        positionOptions={positionOptions}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDateFrom={filterDateFrom}
        setFilterDateFrom={setFilterDateFrom}
        filterDateTo={filterDateTo}
        setFilterDateTo={setFilterDateTo}
      />
    </div>
  );
};

export default Schedule;
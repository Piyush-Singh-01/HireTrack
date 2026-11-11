import React, { useRef, useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Sparkles,
  CalendarDays,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSchedules } from "../../hooks/useSchedule";
import InterviewDetailModal from "../../component/calender/InterviewDetailModal";

/**
 * CalendarPage (Route: /calendar)
 * 
 * Main page controller for the Interview Calendar.
 * Responsibilities:
 * 1. Fetches candidate interview schedules for the logged-in user.
 * 2. Manages calendar views (Month, Week, Day) and responsive screen size adaptation.
 * 3. Provides live status filters (All, Scheduled, Completed).
 * 4. Displays real-time interview summary statistics in the hero banner.
 * 5. Controls the FullCalendar interactive grid and clicked interview detail modal.
 */
const CalendarPage = () => {
  const calendarRef = useRef(null);
  const today = new Date();
  const currentYear = today.getFullYear();
  const userId = localStorage.getItem("userId");

  // Fetch interview schedules from API
  const { data: scheduleData, isLoading } = useSchedules(userId);

  // Calendar navigation & display states
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024);

  // Quick status filter: 'all' | 'scheduled' | 'completed'
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected event for detail modal
  const [activeEvent, setActiveEvent] = useState(null);

  // Month & Year options for dropdown jumper
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Set document title
  useEffect(() => {
    document.title = "Interview Calendar | Talent OS";
  }, []);

  // Responsive screen size listener: auto-switch to Day view on mobile
  useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth < 1024;
      setIsSmallScreen(small);

      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        const targetView = small ? "timeGridDay" : "dayGridMonth";
        calendarApi.changeView(targetView);
        setCurrentView(targetView);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calendar Navigation Handlers
  const handleYearMonthChange = (year, month) => {
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(new Date(year, month, 1));
    }
  };

  const handlePrev = () => {
    if (calendarRef.current) calendarRef.current.getApi().prev();
  };

  const handleNext = () => {
    if (calendarRef.current) calendarRef.current.getApi().next();
  };

  const handleToday = () => {
    if (calendarRef.current) calendarRef.current.getApi().today();
  };

  const handleViewChange = (viewName) => {
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(viewName);
      setCurrentView(viewName);
    }
  };

  // Transform backend schedule items to FullCalendar format
  const allEvents = useMemo(() => {
    return (Array.isArray(scheduleData) ? scheduleData : [])
      .filter((item) => {
        const s = (item.status || "").toLowerCase();
        return !["hired", "rejected", "onhold", "on hold", "on-wait", "on wait", "onwait"].includes(s);
      })
      .map((item) => {
        const start = new Date(item.date);
        if (item.time) {
          const [hours, minutes] = item.time.split(":");
          start.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
        }

        const duration = item.durationMinutes || 30;
        const end = new Date(start.getTime() + duration * 60000);
        const isCompleted = (item.status || "").toLowerCase() === "completed";

        return {
          id: item._id,
          title: `${item.name} | ${item.position}`,
          start,
          end,
          url: item.meetLink,
          extendedProps: {
            candidateName: item.name,
            position: item.position,
            recruiter: item.recruiter,
            status: item.status || "Scheduled",
            mode: item.mode || "Online",
            time: item.time,
            date: item.date,
            meetLink: item.meetLink,
            scheduleType: item.scheduleType,
            duration,
            candidateEmail: item.candidateEmail,
          },
          backgroundColor: isCompleted ? "#10b981" : "#2563eb",
          borderColor: isCompleted ? "#059669" : "#1d4ed8",
        };
      });
  }, [scheduleData]);

  // Filter events by status filter
  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) => {
      const status = (e.extendedProps?.status || "scheduled").toLowerCase();
      if (statusFilter === "scheduled" && status === "completed") return false;
      if (statusFilter === "completed" && status !== "completed") return false;
      return true;
    });
  }, [allEvents, statusFilter]);

  // Real-time interview statistics
  const todayStr = new Date().toISOString().split("T")[0];
  const todayEventsCount = allEvents.filter((e) => {
    const d = new Date(e.start).toISOString().split("T")[0];
    return d === todayStr;
  }).length;

  const completedEventsCount = allEvents.filter(
    (e) => (e.extendedProps?.status || "").toLowerCase() === "completed"
  ).length;

  const onlineEventsCount = allEvents.filter((e) => {
    const mode = (e.extendedProps?.mode || "").toLowerCase();
    return mode === "online" || Boolean(e.url);
  }).length;

  // Custom Event Content Pill in FullCalendar
  const renderEventContent = (eventInfo) => {
    const { extendedProps, title } = eventInfo.event;
    const isCompleted = (extendedProps?.status || "").toLowerCase() === "completed";
    const isOnline = (extendedProps?.mode || "").toLowerCase() === "online" || Boolean(extendedProps?.meetLink);
    const isTimeGrid = eventInfo.view.type.startsWith("timeGrid");

    if (isTimeGrid) {
      return (
        <div className="flex flex-col h-full justify-between p-1.5 rounded-xl text-white bg-gradient-to-br from-[#18264e] to-[#0f172a] shadow-md border border-white/15 overflow-hidden">
          <div>
            <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-cyan-300">
              <span className="truncate">{eventInfo.timeText}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                  isCompleted ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300"
                }`}
              >
                {extendedProps?.status || "Scheduled"}
              </span>
            </div>
            <p className="font-extrabold text-xs text-white truncate mt-1">
              {extendedProps?.candidateName || title}
            </p>
            <p className="text-[10px] text-slate-300 truncate">
              {extendedProps?.position}
            </p>
          </div>
          {extendedProps?.recruiter && (
            <span className="text-[9px] text-slate-400 truncate">
              {extendedProps.recruiter}
            </span>
          )}
        </div>
      );
    }

    // Month Grid Pill View
    return (
      <div
        className={`group/event flex items-center gap-1.5 w-full px-2 py-1 my-0.5 rounded-lg text-xs font-semibold transition-all duration-150 overflow-hidden cursor-pointer shadow-xs border ${
          isCompleted
            ? "bg-emerald-50/95 hover:bg-emerald-100 text-emerald-950 border-emerald-200/80"
            : "bg-blue-50/95 hover:bg-blue-100 text-blue-950 border-blue-200/80"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isCompleted
              ? "bg-emerald-500 shadow-[0_0_6px_#10b981]"
              : "bg-blue-600 shadow-[0_0_6px_#3b82f6]"
          }`}
        />
        {eventInfo.timeText && (
          <span className="font-bold text-[10px] tabular-nums shrink-0 opacity-75">
            {eventInfo.timeText}
          </span>
        )}
        <span className="truncate text-[11px] font-bold flex-1">
          {extendedProps?.candidateName || title}
        </span>
        {isOnline && (
          <span className="shrink-0 text-[10px] text-blue-600 group-hover/event:scale-110 transition-transform">
            <Video size={11} />
          </span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 w-full max-w-7xl mx-auto space-y-6">
        <div className="h-44 rounded-3xl bg-slate-900/10 animate-pulse" />
        <div className="h-[600px] rounded-3xl bg-slate-900/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* 1. Hero Banner & Quick Stats */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121b33] via-[#17254b] to-[#1e3a8a] text-white shadow-xl border border-white/10 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute left-1/4 top-0 h-40 w-40 rounded-full bg-indigo-500/15 blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-cyan-300 backdrop-blur-md mb-2 shadow-inner">
              <Sparkles size={13} className="text-cyan-400 animate-pulse" />
              <span>Talent Intelligence · Schedule Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
              Interview Calendar
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Synchronize candidate interviews, video sessions, and recruiter schedules in real-time
            </p>
          </div>

          {/* Quick Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.08] border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                Total Sessions
              </span>
              <span className="text-xl font-black text-white tabular-nums font-['Outfit',sans-serif]">
                {allEvents.length}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.08] border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                Today
              </span>
              <span className="text-xl font-black text-white tabular-nums font-['Outfit',sans-serif]">
                {todayEventsCount}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.08] border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                Completed
              </span>
              <span className="text-xl font-black text-white tabular-nums font-['Outfit',sans-serif]">
                {completedEventsCount}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.08] border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                Online Meets
              </span>
              <span className="text-xl font-black text-white tabular-nums font-['Outfit',sans-serif]">
                {onlineEventsCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Calendar Controls & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation: Prev, Today, Next, Month Title */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer shadow-xs"
              title="Previous period"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white transition-all cursor-pointer shadow-xs"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer shadow-xs"
              title="Next period"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Active Period Heading */}
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif] min-w-[150px]">
            {currentTitle || `${months[selectedMonth]} ${selectedYear}`}
          </h2>

          {/* Jump to Month & Year Selectors */}
          {!isSmallScreen && (
            <div className="flex items-center gap-2 ml-1">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  const month = parseInt(e.target.value);
                  setSelectedMonth(month);
                  handleYearMonthChange(selectedYear, month);
                }}
                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 hover:bg-white cursor-pointer transition-all"
              >
                {months.map((m, index) => (
                  <option key={m} value={index}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => {
                  const year = parseInt(e.target.value);
                  setSelectedYear(year);
                  handleYearMonthChange(year, selectedMonth);
                }}
                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 hover:bg-white cursor-pointer transition-all"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Controls: Status Filter Pills & View Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Status Filter */}
          <div className="inline-flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/70 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("scheduled")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === "scheduled"
                  ? "bg-white text-blue-600 shadow-xs font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              Scheduled
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === "completed"
                  ? "bg-white text-emerald-600 shadow-xs font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              Completed
            </button>
          </div>

          {/* View Mode Switcher (Month, Week, Day) */}
          {!isSmallScreen && (
            <div className="inline-flex items-center bg-slate-900 p-1 rounded-xl text-xs font-bold text-white shadow-xs">
              <button
                type="button"
                onClick={() => handleViewChange("dayGridMonth")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  currentView === "dayGridMonth"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("timeGridWeek")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  currentView === "timeGridWeek"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("timeGridDay")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  currentView === "timeGridDay"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Day
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. FullCalendar Grid Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.06)] p-3 sm:p-6 w-full overflow-hidden">
        <style>{`
          .fc {
            --fc-border-color: #f1f5f9;
            --fc-today-bg-color: rgba(59, 130, 246, 0.04);
            font-family: inherit;
          }
          .fc-scrollgrid {
            border-radius: 20px !important;
            overflow: hidden !important;
            border-color: #f1f5f9 !important;
          }
          .fc-theme-standard th {
            border-color: #f1f5f9 !important;
            background-color: #f8fafc !important;
            padding: 12px 0 !important;
          }
          .fc-col-header-cell-cushion {
            color: #475569 !important;
            font-weight: 700 !important;
            font-size: 11px !important;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            text-decoration: none !important;
          }
          .fc-daygrid-day-number {
            color: #64748b !important;
            font-weight: 600 !important;
            font-size: 12px !important;
            padding: 8px !important;
            text-decoration: none !important;
          }
          .fc-day-today {
            background-color: rgba(59, 130, 246, 0.04) !important;
          }
          .fc-day-today .fc-daygrid-day-number {
            background: linear-gradient(135deg, #2563eb, #4f46e5);
            color: #ffffff !important;
            border-radius: 9999px;
            width: 26px;
            height: 26px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 4px;
            box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
          }
          .fc-daygrid-day-frame:hover {
            background-color: #fafbfc;
          }
          .fc-daygrid-event {
            background: transparent !important;
            border: none !important;
            margin: 2px 4px !important;
            padding: 0 !important;
          }
          .fc-daygrid-event:hover {
            transform: translateY(-1px);
          }
          .fc-timegrid-slot {
            height: 48px !important;
          }
          .fc-timegrid-slot-label-cushion {
            font-size: 11px !important;
            font-weight: 600 !important;
            color: #64748b !important;
          }
          .fc-timegrid-axis-cushion {
            font-size: 11px !important;
            color: #94a3b8 !important;
          }
          .fc-scroller {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
          .fc-scroller::-webkit-scrollbar {
            display: none !important;
          }
        `}</style>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isSmallScreen ? "timeGridDay" : "dayGridMonth"}
          headerToolbar={false}
          selectable={true}
          editable={true}
          height={isSmallScreen ? "75vh" : "78vh"}
          events={filteredEvents}
          eventContent={renderEventContent}
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            setActiveEvent(info.event);
          }}
          datesSet={(dateInfo) => {
            setCurrentTitle(dateInfo.view.title);
            const newDate = dateInfo.view.currentStart;
            setSelectedMonth(newDate.getMonth());
            setSelectedYear(newDate.getFullYear());
            setCurrentView(dateInfo.view.type);
          }}
        />
      </div>

      {/* 4. Clicked Interview Detail Modal */}
      <InterviewDetailModal
        event={activeEvent}
        onClose={() => setActiveEvent(null)}
      />
    </div>
  );
};

export default CalendarPage;

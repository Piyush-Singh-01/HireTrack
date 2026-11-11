import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaFilter, FaEdit, FaChevronDown } from "react-icons/fa";
import { useSchedulesByDateRange, useSchedulesByPositionStatus } from "../../hooks/useScheduleFilters";
import Reschedule from "./Reschedule";

const FilterResults = ({
  position: propPosition,
  status: propStatus,
  from: propFrom,
  to: propTo,
  onBack,
  ...props
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  // Filter modal state (initialized from URL params or props)
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterPosition, setFilterPosition] = useState(
    propPosition || params.get("position") || "All Position"
  );
  const [filterStatus, setFilterStatus] = useState(
    propStatus || params.get("status") || "All Status"
  );
  const [filterDateFrom, setFilterDateFrom] = useState(
    propFrom || params.get("from") || "01-07-2025"
  );
  const [filterDateTo, setFilterDateTo] = useState(
    propTo || params.get("to") || "31-07-2025"
  );
  const [showCalendarFrom, setShowCalendarFrom] = useState(false);
  const [showCalendarTo, setShowCalendarTo] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 6, 1)); // July 2025
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Keep local state in sync if URL changes externally
  useEffect(() => {
    const nextParams = new URLSearchParams(location.search);
    setFilterPosition(nextParams.get("position") || "All Position");
    setFilterStatus(nextParams.get("status") || "All Status");
    setFilterDateFrom(nextParams.get("from") || "01-07-2025");
    setFilterDateTo(nextParams.get("to") || "31-07-2025");
  }, [location.search]);

  // Data from backend based on URL search params
  const dateFromIso = useMemo(() => {
    // convert dd-mm-yyyy to yyyy-mm-dd for API
    const from = params.get("from");
    if (!from) return undefined;
    const [dd, mm, yyyy] = from.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }, [params]);

  const dateToIso = useMemo(() => {
    const to = params.get("to");
    if (!to) return undefined;
    const [dd, mm, yyyy] = to.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }, [params]);

  const { data: dateRangeRows = [], isLoading: isDateRangeLoading, error: dateRangeError } = useSchedulesByDateRange({ from: dateFromIso, to: dateToIso });

  const position = params.get("position");
  const status = params.get("status");
  const { data: fieldRows = [], isLoading: isFieldLoading, error: fieldError } = useSchedulesByPositionStatus({ position, status });

  const usingFieldFilter = Boolean(position) && position !== 'All Position' && Boolean(status) && status !== 'All Status';
  const apiRowsRaw = usingFieldFilter ? fieldRows : dateRangeRows;

  // Normalize backend fields to UI shape
  const interviews = useMemo(() => {
    if (!Array.isArray(apiRowsRaw)) return [];
    return apiRowsRaw.map((rec) => {
      const rawDate = rec.date || rec.Date || rec.scheduledDate;
      let normalizedDate = rawDate;
      if (typeof rawDate === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
          const [yyyy, mm, dd] = rawDate.split('-');
          normalizedDate = `${dd}-${mm}-${yyyy}`;
        } else {
          const d = new Date(rawDate);
          if (!Number.isNaN(d.getTime())) {
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            normalizedDate = `${dd}-${mm}-${yyyy}`;
          }
        }
      }  
      return {
        name: rec.name || rec.candidate || rec.Candidate || rec.applicantName,
        date: normalizedDate,
        time: rec.time || rec.Time,
        position: rec.position || rec.Position,
        recruiter: rec.recruiter || rec.Recruiter,
        mode: rec.mode || rec.Mode,
        status: rec.status || rec.Status || '--',
      };
    }).filter((r) => r && r.date);
  }, [apiRowsRaw]);

  const parseDMYToDate = (value) => {
    if (!value) return null;
    const str = String(value);
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
      const [dd, mm, yyyy] = str.split('-');
      return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [yyyy, mm, dd] = str.split('-');
      return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
    }
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const isWithinDateRange = (d, from, to) => {
    if (!d) return false;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  };

  const todayDateStr = "16-07-2025";
  const isDateTodayOrFuture = (dmy) => {
    const d = parseDMYToDate(dmy);
    const today = parseDMYToDate(todayDateStr);
    return d && today ? d >= today : false;
  };

  const renderStatus = (interview) => {
    if (isDateTodayOrFuture(interview.date)) {
      return <span className="text-gray-500">--</span>;
    }
    if (interview.status === "Hired") {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#27457E] text-white text-sm font-semibold">Hired</span>
      );
    }
    if (interview.status === "On Hold") {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#27457E] text-white text-sm font-semibold">On-Hold</span>
      );
    }
    return <span className="text-gray-900 font-medium">{interview.status}</span>;
  };

  const shouldShowReschedule = (interview) => {
    return interview.status === "Incomplete" || isDateTodayOrFuture(interview.date);
  };

  const openReschedule = (interview) => {
    setSelectedInterview(interview || null);
    setShowRescheduleModal(true);
  };

  const closeReschedule = () => {
    setShowRescheduleModal(false);
  };

  const filteredRows = useMemo(() => {
    const base = interviews
      .filter((row) => (filterPosition === "All Position" ? true : row.position === filterPosition))
      .filter((row) => (filterStatus === "All Status" ? true : row.status === filterStatus));

    // If using the date-range API already, don't re-filter by date again
    if (!usingFieldFilter && dateFromIso && dateToIso) {
      return base;
    }

    const from = parseDMYToDate(filterDateFrom);
    const to = parseDMYToDate(filterDateTo);
    return base.filter((row) => isWithinDateRange(parseDMYToDate(row.date), from, to));
  }, [interviews, filterPosition, filterStatus, filterDateFrom, filterDateTo, usingFieldFilter, dateFromIso, dateToIso]);

  const handleApplyFilter = () => {
    const query = new URLSearchParams({
      position: filterPosition,
      status: filterStatus,
      from: filterDateFrom,
      to: filterDateTo,
    }).toString();
    setShowFilterModal(false);
    navigate(`/schedule/filters?${query}`);
  };

  const handleCancelFilter = () => {
    setShowFilterModal(false);
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'next') {
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

  return (
    <div className="h-screen p-5 sm:p-4 md:px-12 bg-white">
      {(isDateRangeLoading || isFieldLoading) && (
        <div className="mb-2 text-sm text-gray-600">Loading filtered schedules…</div>
      )}
      {(dateRangeError || fieldError) && (
        <div className="mb-2 text-sm text-red-600">Failed to load schedules.</div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Schedule</h1>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          
          <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition" onClick={() => setShowFilterModal(true)}>
            <span className="text-xs sm:text-sm text-gray-700">Sort By</span>
            <FaFilter className="text-gray-600 w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <span className="inline-flex items-center gap-2 bg-gray-100 border border-gray-300 text-gray-800 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
          {filterPosition}
          <span className="ml-1 text-gray-500">×</span>
        </span>
        <span className="inline-flex items-center gap-2 bg-gray-100 border border-gray-300 text-gray-800 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
          {filterStatus}
          <span className="ml-1 text-gray-500">×</span>
        </span>
        <span className="inline-flex items-center gap-2 bg-gray-100 border border-gray-300 text-gray-800 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
          {filterDateFrom} - {filterDateTo}
          <span className="ml-1 text-gray-500">×</span>
        </span>
      </div>

      {/* Results table */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiter</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reschedule</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRows.map((interview, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{interview.date}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{interview.time}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{interview.position}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{interview.name}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{interview.recruiter}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{interview.mode}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">{renderStatus(interview)}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {shouldShowReschedule(interview) ? (
                      <button className="p-1.5 sm:p-2 border border-gray-300 rounded hover:bg-gray-50" onClick={() => openReschedule(interview)}>
                        <FaEdit className="text-gray-600 w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
            {/* Reschedule Modal */}
      {showRescheduleModal && (
        <Reschedule
          interview={selectedInterview}
          onCancel={closeReschedule}
          onSuccess={closeReschedule}
        />
      )}
      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/30 backdrop-blur-[2px]" onClick={handleCancelFilter}>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-[420px] shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
            {/* Row: Position & Status */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Position</label>
                <div className="relative">
                  <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#324371] focus:border-[#324371] appearance-none bg-white text-sm"
                  >
                    <option value="All Position">All Position</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="UI Designer">UI Designer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#324371] focus:border-[#324371] appearance-none bg-white text-sm"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Upcoming">Hired</option>
                    <option value="Completed">On Hold</option>
                    <option value="Completed">Reject</option>
                    <option value="Incomplete">Incomplete</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            {/* Date Range */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-900 mb-4">Date Range</div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">From</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      placeholder="dd-mm-yyyy"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#324371] focus:border-[#324371] text-sm cursor-pointer"
                      onClick={() => setShowCalendarFrom(true)}
                      readOnly
                    />
                    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">To</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      placeholder="dd-mm-yyyy"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#324371] focus:border-[#324371] text-sm cursor-pointer"
                      onClick={() => setShowCalendarTo(true)}
                      readOnly
                    />
                    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex justify-center gap-4 pt-6">
              <button
                onClick={handleApplyFilter}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#324371] text-white text-sm font-semibold hover:bg-[#2a3a5f] transition-colors"
              >
                Apply
              </button>
              <button
                onClick={handleCancelFilter}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-gray-300 text-gray-800 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Popup for From Date */}
      {showCalendarFrom && (
        <div className="fixed inset-0 z-50" onClick={() => setShowCalendarFrom(false)}>
          <div className="absolute top-0 left-0 w-full h-full bg-transparent"></div>
          <div className="absolute bg-white rounded-lg p-3 shadow-xl border border-gray-200" style={{ top: '30%', right: '25%', transform: 'translateX(50%)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => navigateMonth('prev')} className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-sm font-semibold">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() => navigateMonth('next')} className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-3">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {getDaysInMonth(currentMonth).map((day, index) => (
                <button
                  key={index}
                  onClick={() => day && handleCalendarDateSelect(day, true)}
                  disabled={!day}
                  className={`p-1 text-xs rounded hover:bg-[#e8ecf5] ${
                    day ? 'hover:bg-[#e8ecf5] cursor-pointer' : ''
                  } ${
                    day && formatDate(day) === filterDateFrom ? 'bg-[#324371] text-white' : ''
                  }`}
                >
                  {day ? day.getDate() : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Popup for To Date */}
      {showCalendarTo && (
        <div className="fixed inset-0 z-50" onClick={() => setShowCalendarTo(false)}>
          <div className="absolute top-0 left-0 w-full h-full bg-transparent"></div>
          <div className="absolute bg-white rounded-lg p-3 shadow-xl border border-gray-200" style={{ top: '30%', right: '10%', transform: 'translateX(50%)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => navigateMonth('prev')} className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-sm font-semibold">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() => navigateMonth('next')} className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-3">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {getDaysInMonth(currentMonth).map((day, index) => (
                <button
                  key={index}
                  onClick={() => day && handleCalendarDateSelect(day, false)}
                  disabled={!day}
                  className={`p-1 text-xs rounded hover:bg-[#e8ecf5] ${
                    day ? 'hover:bg-[#e8ecf5] cursor-pointer' : ''
                  } ${
                    day && formatDate(day) === filterDateTo ? 'bg-[#324371] text-white' : ''
                  }`}
                >
                  {day ? day.getDate() : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterResults;




import React from "react";
import { Link } from "react-router-dom";
import { FaClock } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import { FiCalendar } from "react-icons/fi";
import {
  Card,
  Avatar,
  ModeBadge,
  EmptyState,
  formatTimeToAMPM,
  has45MinutesPassedFromSchedule,
  getDisplayName,
} from "./DashboardCommon";

/**
 * Dashboard Schedule Component.
 * Displays today's or selected period's scheduled interviews in both
 * desktop table and mobile card list views.
 */
const DashboardSchedule = ({
  interviewData = [],
  selected = "Today",
  isTodayView = true,
  onStartInterviewClick,
  onDetailsClick,
}) => {
  const renderRowActions = (item, fullWidth = false) => {
    const disabled = has45MinutesPassedFromSchedule(item);
    return (
      <div className={`flex items-center gap-2 ${fullWidth ? "w-full" : "justify-end"}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            onStartInterviewClick(item);
          }}
          className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            fullWidth ? "flex-1" : ""
          } ${
            disabled
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-blue text-white shadow-sm hover:shadow hover:opacity-95 cursor-pointer"
          }`}
          title={disabled ? "Interview window has passed" : "Start interview"}
        >
          Start Interview
        </button>
        <button
          type="button"
          onClick={() => onDetailsClick(item)}
          className={`inline-flex items-center justify-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-blue border border-slate-200 bg-white hover:border-blue hover:bg-blue/5 transition-colors cursor-pointer ${
            fullWidth ? "flex-1" : ""
          }`}
        >
          Details
        </button>
      </div>
    );
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            {isTodayView ? "Today's" : `${selected}'s`} Schedule
          </h2>
          <p className="text-sm text-slate-500">
            {interviewData.length} interview{interviewData.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>
        <Link
          to="/schedule"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue hover:gap-3 transition-all"
        >
          View full schedule <FaArrowRightLong />
        </Link>
      </div>

      <Card className="overflow-hidden">
        {/* Mobile: card list */}
        <div className="md:hidden divide-y divide-slate-100">
          {interviewData.length === 0 ? (
            <EmptyState
              icon={<FiCalendar />}
              title={
                isTodayView
                  ? "No interviews scheduled today"
                  : `No interviews for ${selected.toLowerCase()}`
              }
              subtitle="New interviews will appear here once scheduled."
            />
          ) : (
            interviewData.map((item, i) => (
              <div key={i} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={getDisplayName(item)} />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate flex items-center gap-2">
                        {getDisplayName(item)}
                        {item.scheduleType === "Group Interview" && (
                          <span className="bg-blue/10 text-blue text-[10px] font-bold px-2 py-0.5 rounded-full">
                            GD
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <FaClock className="text-[10px]" />
                        {formatTimeToAMPM(item.time || item.Time)}
                      </p>
                    </div>
                  </div>
                  <ModeBadge mode={item.mode || item.Mode} />
                </div>
                {renderRowActions(item, true)}
              </div>
            ))
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Candidate
                </th>
                <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Time
                </th>
                <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mode
                </th>
                <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {interviewData.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      icon={<FiCalendar />}
                      title={
                        isTodayView
                          ? "No interviews scheduled today"
                          : `No interviews for ${selected.toLowerCase()}`
                      }
                      subtitle="New interviews will appear here once scheduled."
                    />
                  </td>
                </tr>
              ) : (
                interviewData.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={getDisplayName(item)} />
                        <span className="font-semibold text-slate-900">
                          {getDisplayName(item)}
                        </span>
                        {item.scheduleType === "Group Interview" && (
                          <span className="bg-blue/10 text-blue text-[10px] font-bold px-2 py-0.5 rounded-full">
                            GD
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 tabular-nums whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <FaClock className="text-[11px] text-slate-400" />
                        {formatTimeToAMPM(item.time || item.Time)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <ModeBadge mode={item.mode || item.Mode} />
                    </td>
                    <td className="py-3.5 px-5">{renderRowActions(item)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
};

export default DashboardSchedule;

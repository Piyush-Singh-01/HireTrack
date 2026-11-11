import React from "react";
import { CheckCheck, Star, Clock, Inbox, Sparkles, RotateCw } from "lucide-react";

const NotificationEmptyState = ({
  filterUnreadOnly,
  searchQuery,
  activeTab,
  onClearUnreadFilter,
  onClearSearch,
  onRefresh,
}) => {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 backdrop-blur-sm p-8 sm:p-10 text-center shadow-xs flex flex-col items-center justify-center">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-100 flex items-center justify-center shadow-inner">
          {filterUnreadOnly ? (
            <CheckCheck className="w-10 h-10 text-emerald-500" />
          ) : activeTab === "Favourite" ? (
            <Star className="w-10 h-10 text-amber-400" />
          ) : activeTab === "Reminder" ? (
            <Clock className="w-10 h-10 text-amber-500" />
          ) : (
            <Inbox className="w-10 h-10 text-slate-400" />
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
        {filterUnreadOnly
          ? "All caught up! Zero unread notifications"
          : searchQuery
          ? "No notifications matching your search"
          : activeTab === "Favourite"
          ? "No starred notifications yet"
          : activeTab === "Reminder"
          ? "No upcoming interview reminders"
          : activeTab === "Applicants"
          ? "No new applicant alerts"
          : "Inbox Zero · All Caught Up"}
      </h3>

      <p className="text-slate-500 text-sm max-w-sm mt-2 font-normal">
        {filterUnreadOnly
          ? "You have acknowledged all pending alerts in this view."
          : searchQuery
          ? `No results found for "${searchQuery}". Try a different keyword.`
          : "We will automatically notify you when applicants apply, interviews are scheduled, or reminders trigger."}
      </p>

      <div className="flex items-center gap-3 mt-6">
        {filterUnreadOnly && (
          <button
            type="button"
            onClick={onClearUnreadFilter}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            Show All Notifications
          </button>
        )}

        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Clear Search Filter
          </button>
        )}

        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center cursor-pointer gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationEmptyState;

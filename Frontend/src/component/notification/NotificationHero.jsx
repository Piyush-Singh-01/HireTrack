import React from "react";
import {
  Bell,
  BellRing,
  Clock,
  Star,
  CheckCheck,
  RotateCw,
} from "lucide-react";

const NotificationHero = ({
  unreadCount = 0,
  totalCount = 0,
  remindersCount = 0,
  favouritesCount = 0,
  activeTab = "All",
  filterUnreadOnly = false,
  isMarkingAllAsRead = false,
  isRefreshing = false,
  onMarkAllAsRead,
  onRefresh,
  onSelectTab,
  onToggleUnreadFilter,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#121b33] via-[#17254b] to-[#1e3a8a] text-white p-6 sm:p-8 border border-white/10 shadow-2xl">
      {/* Ambient Glowing Orbs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            Talent Intelligence · Inbox Hub
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-['Outfit'] mt-3 flex items-center gap-3">
            <span>Notifications</span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-slate-300 font-sans font-medium">
              Live Feed
            </span>
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl font-normal">
            Real-time hiring alerts, interview reminders, candidate activity & flagged updates.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={
              isMarkingAllAsRead ||
              totalCount === 0 ||
              unreadCount === 0
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.98] cursor-pointer"
            title="Mark all notifications as read"
          >
            <CheckCheck className="w-4 h-4 text-cyan-300" />
            <span>
              {isMarkingAllAsRead ? "Updating..." : "Mark All Read"}
            </span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 cursor-pointer rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all duration-200 disabled:opacity-40 hover:shadow-lg active:scale-[0.98]"
            title="Refresh notifications"
          >
            <RotateCw
              className={`w-4 h-4 text-cyan-300 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
        {/* Card 1: Total Alerts */}
        <div
          onClick={() => {
            onSelectTab("All");
            if (filterUnreadOnly) onToggleUnreadFilter(false);
          }}
          className={`p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-cyan-400/40 ${
            activeTab === "All" && !filterUnreadOnly
              ? "ring-2 ring-cyan-400/60 bg-white/15"
              : ""
          }`}
        >
          <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
            <span>Total Alerts</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] mt-2">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            All unified notifications
          </div>
        </div>

        {/* Card 2: Unread */}
        <div
          onClick={() => {
            onSelectTab("All");
            onToggleUnreadFilter(!filterUnreadOnly);
          }}
          className={`p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-rose-400/40 ${
            filterUnreadOnly
              ? "ring-2 ring-rose-400/60 bg-rose-500/15"
              : ""
          }`}
        >
          <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
            <span>Unread</span>
            <div className="relative p-1.5 rounded-lg bg-rose-500/20 text-rose-300">
              <BellRing className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              )}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-300 font-['Outfit'] mt-2">
            {unreadCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {filterUnreadOnly ? "Showing unread only" : "Click to isolate unread"}
          </div>
        </div>

        {/* Card 3: Reminders */}
        <div
          onClick={() => {
            onSelectTab("Reminder");
            if (filterUnreadOnly) onToggleUnreadFilter(false);
          }}
          className={`p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-amber-400/40 ${
            activeTab === "Reminder"
              ? "ring-2 ring-amber-400/60 bg-white/15"
              : ""
          }`}
        >
          <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
            <span>Reminders</span>
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] mt-2">
            {remindersCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Scheduled tasks & interviews
          </div>
        </div>

        {/* Card 4: Favourites */}
        <div
          onClick={() => {
            onSelectTab("Favourite");
            if (filterUnreadOnly) onToggleUnreadFilter(false);
          }}
          className={`p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-amber-400/40 ${
            activeTab === "Favourite"
              ? "ring-2 ring-amber-400/60 bg-white/15"
              : ""
          }`}
        >
          <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
            <span>Starred</span>
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-['Outfit'] mt-2">
            {favouritesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Flagged for follow-up
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationHero;

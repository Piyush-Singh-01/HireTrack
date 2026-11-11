import React from "react";
import { Search, X } from "lucide-react";

const NotificationToolbar = ({
  tabs = [],
  activeTab = "All",
  onSelectTab,
  filterUnreadOnly = false,
  onToggleUnreadFilter,
  searchQuery = "",
  onSearchChange,
  onClearSearch,
}) => {
  return (
    <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.label;
          const TabIcon = tab.icon;
          return (
            <button
              type="button"
              key={tab.label}
              onClick={() => onSelectTab(tab.label)}
              className={`flex items-center gap-2 px-3.5 py-2 cursor-pointer rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <TabIcon
                className={`w-3.5 h-3.5 ${
                  isActive ? "text-white" : "text-slate-400"
                }`}
              />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Quick Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Unread Only filter button */}
        <button
          type="button"
          onClick={() => onToggleUnreadFilter(!filterUnreadOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 cursor-pointer rounded-xl text-xs font-semibold border transition-all duration-200 whitespace-nowrap shrink-0 active:scale-95 ${
            filterUnreadOnly
              ? "bg-blue-50 text-blue-700 border-blue-200 shadow-xs"
              : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              filterUnreadOnly ? "bg-blue-600 animate-pulse" : "bg-slate-300"
            }`}
          />
          <span>Unread Only</span>
        </button>

        {/* Search Input Field */}
        <div className="relative flex-1 sm:w-64 min-w-[180px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter notifications..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationToolbar;

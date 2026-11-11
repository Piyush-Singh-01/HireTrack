import React from "react";
import { Clock, Check, Star, Trash2 } from "lucide-react";
import { getCategoryMeta } from "./notificationUtils";

const NotificationItem = ({
  item,
  onToggleFavourite,
  onDelete,
  onMarkSeen,
}) => {
  const meta = getCategoryMeta(item);
  const IconComponent = meta.Icon;

  return (
    <div
      className={`group relative flex items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
        !item.isSeen
          ? "bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white border-blue-200/90 shadow-sm hover:shadow-md hover:border-blue-300"
          : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Glowing Unread Beacon indicator on left edge */}
      {!item.isSeen && (
        <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      )}

      {/* Main Left Content */}
      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Category Icon Badge */}
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-xs transition-transform group-hover:scale-105 ${meta.bg}`}
        >
          <IconComponent className={`w-5 h-5 ${meta.color}`} />
        </div>

        {/* Text Details & Message */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onMarkSeen?.(item)}
        >
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${meta.pill}`}
            >
              {meta.label}
            </span>

            {!item.isSeen && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold tracking-wide">
                NEW
              </span>
            )}

            {/* Mobile timestamp */}
            <span className="text-slate-400 text-xs flex items-center gap-1 sm:hidden ml-auto">
              <Clock className="w-3 h-3 text-slate-400" />
              {item.time}
            </span>
          </div>

          <p
            className={`text-xs sm:text-sm leading-relaxed transition-colors ${
              !item.isSeen
                ? "font-semibold text-slate-900 group-hover:text-blue-900"
                : "font-normal text-slate-600 group-hover:text-slate-900"
            }`}
          >
            {item.message}
          </p>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2 shrink-0 sm:ml-4">
        {/* Timestamp badge on desktop */}
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {item.time}
        </span>

        {/* Quick Mark as Read button (if unread) */}
        {!item.isSeen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkSeen?.(item);
            }}
            className="p-2 rounded-xl text-blue-600 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 transition-all duration-150 active:scale-95 cursor-pointer"
            title="Mark as read"
          >
            <Check className="w-4 h-4 text-blue-600" />
          </button>
        )}

        {/* Star / Favourite button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavourite?.(item);
          }}
          className={`p-2 rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer ${
            item.isFavourite
              ? "bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-100 shadow-xs"
              : "text-slate-300 hover:text-amber-500 hover:bg-amber-50/70 border-transparent hover:border-amber-200"
          }`}
          title={item.isFavourite ? "Remove from favourites" : "Star as favourite"}
        >
          <Star
            className={`w-4 h-4 ${
              item.isFavourite
                ? "fill-amber-400 text-amber-500"
                : "text-slate-400 group-hover:text-slate-600"
            }`}
          />
        </button>

        {/* Delete notification button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(item);
          }}
          className="p-2 rounded-xl text-slate-400 cursor-pointer hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors active:scale-95"
          title="Delete notification"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;

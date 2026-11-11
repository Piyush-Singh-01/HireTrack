import React from "react";

const NotificationSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="p-5 rounded-2xl border border-slate-200/70 bg-white shadow-xs animate-pulse flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-11 h-11 rounded-xl bg-slate-200/80 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3.5 bg-slate-200 rounded w-24" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-7 bg-slate-200 rounded-lg hidden sm:block" />
          <div className="w-8 h-8 bg-slate-200 rounded-xl" />
          <div className="w-8 h-8 bg-slate-200 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

export default NotificationSkeleton;

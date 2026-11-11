import React from "react";
import { Sparkles } from "lucide-react";
import { FiCalendar } from "react-icons/fi";

/**
 * Dashboard Header Hero Banner.
 * Displays portal badge, greeting, today's date, and period filter pills.
 */
const DashboardHeader = ({
  greeting = "Welcome",
  todayLabel = "",
  options = ["Today", "Tomorrow", "This Week", "This Month"],
  selected = "Today",
  onSelectPeriod,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121b33] via-[#17254b] to-[#1e3a8a] text-white shadow-xl border border-white/10">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-24 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute left-1/4 top-0 h-40 w-40 rounded-full bg-indigo-500/15 blur-2xl" />

      <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-cyan-300 backdrop-blur-md mb-2 shadow-inner">
            <Sparkles size={13} className="text-cyan-400 animate-pulse" />
            <span>Talent Intelligence Portal</span>
          </div>
          <p className="text-sm text-slate-300 font-medium">{greeting}</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
            Recruitment Dashboard
          </h1>
          <p className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-300">
            <FiCalendar className="shrink-0 text-cyan-400" />
            {todayLabel}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Show interviews for
          </span>
          <div className="inline-flex flex-wrap gap-1.5 rounded-2xl bg-slate-950/45 p-1.5 ring-1 ring-inset ring-white/10 backdrop-blur-md">
            {options.map((opt) => {
              const active = selected === opt || (opt === "Today" && selected === "Sort By");
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onSelectPeriod(opt)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;

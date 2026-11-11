import React from "react";
import {
  FiBriefcase,
  FiTarget,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiArchive,
} from "react-icons/fi";

const KPI_ICONS = [FiBriefcase, FiTarget, FiUsers, FiCheckCircle, FiClock, FiArchive];

const KPI_ACCENTS = [
  "from-indigo-500 to-blue-500",
  "from-violet-500 to-purple-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-500 to-red-500",
];

/**
 * PositionKPIs Component
 * Renders the responsive KPI summary cards grid for the Positions page.
 */
const PositionKPIs = ({ kpiData = [] }) => {
  if (!kpiData || kpiData.length === 0) return null;

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {kpiData.map((kpi, index) => {
        if (!kpi) return null;
        const Icon = KPI_ICONS[index % KPI_ICONS.length];
        const accent = KPI_ACCENTS[index % KPI_ACCENTS.length];

        return (
          <div
            key={kpi.title || index}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_16px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />

            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs lg:text-sm font-medium text-slate-500 truncate">
                {kpi.title}
              </h3>
              <div
                className={`h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br ${accent} text-white flex items-center justify-center text-sm shadow-sm`}
              >
                <Icon />
              </div>
            </div>

            <div className="mt-3 text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">
              {kpi.value}
            </div>

            {kpi.subtitle && (
              <div className="mt-1 text-[11px] md:text-xs text-slate-500">
                <span className={`font-semibold ${kpi.subtitleColor || ""}`}>
                  {kpi.subtitleValue}
                </span>{" "}
                {kpi.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default PositionKPIs;

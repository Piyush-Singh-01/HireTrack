import React from "react";
import { FiChevronRight } from "react-icons/fi";
import { Card, STAT_ACCENTS } from "./DashboardCommon";

/**
 * Dashboard Stat Cards Component.
 * Displays key recruitment metrics with expandable detail breakdowns.
 */
const DashboardStats = ({ stats = [], expanded = {}, onToggleExpand }) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 -mt-4 relative">
      {stats.map((stat, i) => {
        const isExpanded = !!expanded[i];
        const hasDetails = !!stat.details;

        return (
          <Card
            key={i}
            className="group relative overflow-hidden p-5 flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl duration-300"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
                STAT_ACCENTS[i % STAT_ACCENTS.length]
              }`}
            />

            {!isExpanded ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                      {stat.label}
                    </p>
                    {stat.sub && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</p>
                    )}
                  </div>
                  <div
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${
                      STAT_ACCENTS[i % STAT_ACCENTS.length]
                    } text-white flex items-center justify-center text-lg shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}
                  >
                    {stat.icon}
                  </div>
                </div>

                <div className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums tracking-tight font-['Outfit',sans-serif]">
                  {stat.value ?? "—"}
                </div>

                <div className="mt-auto pt-4">
                  {hasDetails ? (
                    <button
                      type="button"
                      onClick={() => onToggleExpand(i)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue hover:gap-2 transition-all cursor-pointer"
                    >
                      View breakdown <FiChevronRight />
                    </button>
                  ) : (
                    <span className="invisible text-sm">.</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-700">{stat.label}</p>
                <div className="mt-3 space-y-1">
                  {stat.details?.map((detail, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
                    >
                      <span className="text-slate-500">{detail.label}</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {detail.value ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onToggleExpand(i)}
                  className="mt-auto pt-3 self-end text-sm font-medium text-blue hover:underline cursor-pointer"
                >
                  Hide
                </button>
              </>
            )}
          </Card>
        );
      })}
    </section>
  );
};

export default DashboardStats;

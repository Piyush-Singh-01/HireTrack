import React, { useState } from "react";
import {
  TrendingUp,
  Sparkles,
  Activity,
  ArrowUpRight,
  BarChart2,
  PieChart as PieIcon,
  CheckCircle2,
} from "lucide-react";
import { FaChevronDown } from "react-icons/fa";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
} from "recharts";
import { Card, CHART_COLORS } from "./DashboardCommon";

const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-white/10 text-xs animate-fadeIn">
        <p className="text-slate-400 text-[11px] font-medium truncate max-w-[170px] mb-1">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
          <span className="font-extrabold text-white text-sm tabular-nums">
            {payload[0].value} {payload[0].value === 1 ? "hire" : "hires"}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { stage, value } = payload[0].payload;
    const stageColor =
      stage === "Hired"
        ? "#10b981"
        : stage === "Selected"
        ? "#8b5cf6"
        : "#3b82f6";

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-white/10 text-xs animate-fadeIn">
        <p className="text-slate-400 text-[11px] font-medium mb-1">
          Stage: <span className="text-white font-semibold">{stage}</span>
        </p>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shadow-sm"
            style={{ backgroundColor: stageColor, boxShadow: `0 0 8px ${stageColor}` }}
          />
          <span className="font-extrabold text-white text-sm tabular-nums">
            {value ?? 0} {value === 1 ? "Candidate" : "Candidates"}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Dashboard Analytics Component.
 * Visualizes Time to Hire, Conversion Funnel, and Candidate Status Breakdown.
 */
const DashboardAnalytics = ({
  data = [],
  shortLabelMap = {},
  monthlyHiredQuery = {},
  conversionData = [],
  interviewAnalyticsQuery = {},
  donutData = [],
  candidateRates = {},
  position = "All Positions",
  setPosition,
  activeIndex = null,
  setActiveIndex,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasData = donutData.some((d) => d.value > 0);
  const emptyDonutData = [{ name: "No Data", value: 1 }];
  const isLoadingChart = candidateRates?.isLoading;

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          cornerRadius={6}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 11}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.35}
          cornerRadius={3}
        />
      </g>
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp size={16} />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Recruitment Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline velocity, conversion funnels, and candidate breakdown
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50/80 border border-blue-200/60 px-3 py-1 rounded-full self-start sm:self-auto shadow-sm">
          <Sparkles size={13} className="text-cyan-500 animate-pulse" />
          <span>Live Insights</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 [@media(min-width:1000px)_and_(max-width:1300px)]:grid-cols-2">
        {/* 1. Time to hire */}
        <Card className="relative overflow-hidden p-5 flex flex-col justify-between border-t-2 border-t-blue-500 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-md bg-blue-50 text-blue-600">
                  <Activity size={14} />
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Time to Hire
                </p>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                  25 <span className="text-sm font-semibold text-slate-500">days</span>
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Average time to fill positions</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 ring-1 ring-inset ring-emerald-200 px-2.5 py-1 rounded-full shadow-sm">
                <ArrowUpRight size={13} />
                {monthlyHiredQuery.data?.last30Days || "+0%"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Last 30 days</span>
            </div>
          </div>

          <div className="relative mt-4 h-[210px] w-full">
            {data.length === 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center text-xs font-semibold text-slate-400 bg-white/70 backdrop-blur-xs rounded-xl">
                No hiring data available yet
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="timeToHireArea" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="60%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="timeToHireLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                  padding={
                    typeof window !== "undefined" && window.innerWidth >= 400
                      ? { left: 25, right: 10 }
                      : { left: 10, right: 5 }
                  }
                  tickFormatter={(value) =>
                    typeof window !== "undefined" && window.innerWidth >= 1024
                      ? value
                      : shortLabelMap[value] || value
                  }
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 6]}
                  ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                  tickFormatter={(value) => (value === 7 ? "6+" : value)}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="url(#timeToHireLine)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#timeToHireArea)"
                  activeDot={{
                    r: 6,
                    fill: "#06b6d4",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 2. Conversion Rate */}
        <Card className="relative overflow-hidden p-5 flex flex-col justify-between border-t-2 border-t-violet-500 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-md bg-violet-50 text-violet-600">
                  <BarChart2 size={14} />
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Conversion Rate
                </p>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                  {interviewAnalyticsQuery.data?.conversionRate ?? "—"}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Applied to Hired efficiency</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 ring-1 ring-inset ring-emerald-200 px-2.5 py-1 rounded-full shadow-sm">
                <ArrowUpRight size={13} />
                {interviewAnalyticsQuery.data?.last30Days ?? "+0%"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Last 30 days</span>
            </div>
          </div>

          <div className="mt-4 h-[210px] w-full flex flex-col justify-between">
            <div className="h-[155px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={conversionData} barCategoryGap="25%">
                  <defs>
                    <linearGradient id="barGrad-0" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="barGrad-1" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                    <linearGradient id="barGrad-2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide padding={{ left: 10, right: 20 }} />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    axisLine={false}
                    tickLine={false}
                    width={65}
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#475569" }}
                  />
                  <Tooltip
                    content={<CustomBarTooltip />}
                    cursor={{ fill: "rgba(99,102,241,0.06)", radius: 8 }}
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20} isAnimationActive>
                    {conversionData.map((_, i) => (
                      <Cell key={i} fill={`url(#barGrad-${i})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stage Flow Pill Summary */}
            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-center">
              {conversionData.map((s, idx) => {
                const dotColor =
                  idx === 0 ? "bg-blue-500" : idx === 1 ? "bg-purple-500" : "bg-emerald-500";
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      {s.stage}
                    </span>
                    <span className="text-xs font-bold text-slate-800 tabular-nums">
                      {s.value ?? 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* 3. Candidate Status (Donut) */}
        <Card className="relative overflow-hidden p-5 flex flex-col justify-between border-t-2 border-t-emerald-500 hover:shadow-xl transition-all duration-300 [@media(min-width:1000px)_and_(max-width:1300px)]:col-span-2 group">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                  <PieIcon size={14} />
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Candidate Status
                </p>
              </div>
              <p className="mt-1 text-base font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                Breakdown by stage
              </p>
            </div>

            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-52">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className="w-full border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold bg-slate-50/70 text-slate-700 flex justify-between items-center cursor-pointer hover:bg-white hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <span className="truncate">{position}</span>
                <FaChevronDown
                  className={`text-[10px] text-slate-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                  <div className="absolute right-0 z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-2xl p-1 animate-scaleIn">
                    {candidateRates?.data?.roles?.map((role, index) => {
                      const value = role === "All" ? "All Positions" : role;
                      const isSel = position === value;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setPosition(value);
                            setIsOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                            isSel
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate">{value}</span>
                          {isSel && <CheckCircle2 size={13} className="shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 mt-2">
            <div className="relative shrink-0 h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hasData ? donutData : emptyDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={88}
                    paddingAngle={hasData ? 3 : 0}
                    cornerRadius={hasData ? 5 : 0}
                    dataKey="value"
                    activeIndex={hasData ? activeIndex : undefined}
                    activeShape={hasData ? renderActiveShape : undefined}
                    onMouseEnter={hasData ? (_, index) => setActiveIndex(index) : undefined}
                    onMouseLeave={hasData ? () => setActiveIndex(null) : undefined}
                    isAnimationActive={hasData}
                    stroke="none"
                  >
                    {(hasData ? donutData : emptyDonutData).map((_, i) => (
                      <Cell
                        key={i}
                        fill={hasData ? CHART_COLORS[i % CHART_COLORS.length] : "#E2E8F0"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {isLoadingChart ? (
                  <span className="text-xs text-slate-400 animate-pulse">Loading…</span>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-50/80 border border-slate-100/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center p-2 text-center transition-all duration-200">
                    <div className="text-xl font-black text-slate-900 tabular-nums tracking-tight">
                      {activeIndex !== null
                        ? `${Math.round(donutData[activeIndex]?.percentage || 0)}%`
                        : "100%"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold truncate max-w-[70px] mt-0.5">
                      {activeIndex !== null
                        ? `${donutData[activeIndex]?.value} candidates`
                        : `${candidateRates.data?.total || 0} total`}
                    </div>
                    {activeIndex !== null && (
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1"
                        style={{
                          backgroundColor: CHART_COLORS[activeIndex % CHART_COLORS.length],
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Legend list */}
            <div className="w-full flex-1 space-y-1.5 max-h-[200px] overflow-y-auto hide-scrollbar">
              {donutData.map((entry, i) => {
                const isActive = activeIndex === i;
                const color = CHART_COLORS[i % CHART_COLORS.length];
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                      isActive ? "bg-slate-100 shadow-sm" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                        style={{
                          backgroundColor: color,
                          boxShadow: isActive ? `0 0 8px ${color}` : "none",
                        }}
                      />
                      <span
                        className={`text-xs text-slate-700 truncate ${
                          isActive ? "font-bold text-slate-900" : "font-medium"
                        }`}
                      >
                        {entry.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-800 tabular-nums">
                        {entry.value}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded-md tabular-nums">
                        {Math.round(entry.percentage)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default DashboardAnalytics;

import React from "react";

/**
 * TimingPreferencesSection Component
 * 
 * Section 1 of Meeting Settings:
 * Allows recruiters to configure:
 * 1. Default interview duration (30 min, 1 hr, or custom hrs/mins)
 * 2. Max interviews per day (3, 5, 10, or custom number)
 * 3. Timing buffers before and after interviews (5 min, 10 min)
 */
const TimingPreferencesSection = ({
  form,
  setForm,
  isCustom,
  setIsCustom,
  customHrs,
  setCustomHrs,
  customMins,
  setCustomMins,
  onCustomDurationChange,
  isCustomMax,
  setIsCustomMax,
  customMaxVal,
  setCustomMaxVal,
}) => {
  const controlClass =
    "w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
  const labelClass =
    "mb-2 block text-[13px] font-semibold tracking-wide text-slate-700";

  return (
    <section className="group overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)] transition duration-300 hover:shadow-[0_14px_38px_rgba(30,41,59,0.08)]">
      {/* Section Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-white via-[#fafaff] to-[#f5f7ff] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
              <path
                d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h3m-3 3h7"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Interview preferences
              </h2>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                01 / 02
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Define the duration, daily limit, and buffer time for every interview.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-indigo-100 bg-white/80 px-3 py-2 text-xs font-medium text-indigo-600 sm:inline-flex">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              d="M12 3.5 14.6 9l5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2L9.4 9 12 3.5Z"
              strokeLinejoin="round"
            />
          </svg>
          Scheduling controls
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 sm:p-7 lg:grid-cols-2 lg:gap-6">
        {/* 1. Duration card */}
        <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-4 sm:p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <svg
                className="h-[18px] w-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7v5l3.2 2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800">
                Default interview duration
              </label>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Choose how long a standard interview should last.
              </p>
            </div>
          </div>

          <select
            className={controlClass}
            value={isCustom ? "custom" : form.defaultInterviewDuration}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "custom") {
                setIsCustom(true);
                const h = customHrs || "1";
                const m = customMins || "0";
                setCustomHrs(h);
                setCustomMins(m);
                onCustomDurationChange(h, m);
              } else {
                setIsCustom(false);
                setForm((prev) => ({
                  ...prev,
                  defaultInterviewDuration: val,
                }));
              }
            }}
          >
            <option value="60">1 hr</option>
            <option value="30">30 min</option>
            <option value="custom">Custom</option>
          </select>

          {isCustom && (
            <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/70 p-3.5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700">
                Set a custom duration
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="no-spinner w-[76px] rounded-lg border border-violet-100 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                    value={customHrs}
                    placeholder="0"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setCustomHrs(v);
                      onCustomDurationChange(v, customMins);
                    }}
                  />
                  <span className="text-xs font-medium text-slate-600">Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="no-spinner w-[76px] rounded-lg border border-violet-100 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                    value={customMins}
                    placeholder="0"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      if (v !== "" && Number(v) > 59) return;
                      setCustomMins(v);
                      onCustomDurationChange(customHrs, v);
                    }}
                  />
                  <span className="text-xs font-medium text-slate-600">Minutes</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Capacity card */}
        <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-4 sm:p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <svg
                className="h-[18px] w-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM16 4.5a3.5 3.5 0 0 1 0 6.8M17 15h1.5a3.5 3.5 0 0 1 3.5 3.5V20"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800">
                Max interviews per day
              </label>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Set the maximum number of interviews your team can schedule daily.
              </p>
            </div>
          </div>

          <select
            className={controlClass}
            value={isCustomMax ? "custom" : form.maxInterviewPerDay}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "custom") {
                setIsCustomMax(true);
                const v = customMaxVal || "1";
                setCustomMaxVal(v);
                setForm((prev) => ({ ...prev, maxInterviewPerDay: v }));
              } else {
                setIsCustomMax(false);
                setForm((prev) => ({ ...prev, maxInterviewPerDay: val }));
              }
            }}
          >
            <option value="3">3 interviews</option>
            <option value="5">5 interviews</option>
            <option value="10">10 interviews</option>
            <option value="custom">Custom</option>
          </select>

          {isCustomMax && (
            <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50/70 p-3.5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
                Set a custom daily limit
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  className="no-spinner w-24 rounded-lg border border-sky-100 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10"
                  value={customMaxVal}
                  placeholder="Value"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setCustomMaxVal(v);
                    setForm((prev) => ({ ...prev, maxInterviewPerDay: v }));
                  }}
                />
                <span className="text-xs font-medium text-slate-500">
                  interviews per day
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Buffer timing settings */}
        <div className="rounded-2xl border border-slate-200/80 bg-[#fbfcff] p-4 sm:col-span-2 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Interview timing buffers
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Add a little breathing room before and after each scheduled interview.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  d="M12 3v3m0 12v3M3 12h3m12 0h3M5.64 5.64l2.12 2.12m8.48 8.48 2.12 2.12m0-12.72-2.12 2.12m-8.48 8.48-2.12 2.12"
                  strokeLinecap="round"
                />
              </svg>
              Buffer time
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <label className={labelClass}>Start before</label>
              <select
                className={controlClass}
                value={form.interviewTimings.startBefore}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    interviewTimings: {
                      ...prev.interviewTimings,
                      startBefore: Number(e.target.value),
                    },
                  }))
                }
              >
                <option value={5}>5 Mins</option>
                <option value={10}>10 Mins</option>
              </select>
              <p className="mt-2 text-[11px] text-slate-400">
                Time reserved before the interview starts.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <label className={labelClass}>End after</label>
              <select
                className={controlClass}
                value={form.interviewTimings.endAfter}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    interviewTimings: {
                      ...prev.interviewTimings,
                      endAfter: Number(e.target.value),
                    },
                  }))
                }
              >
                <option value={5}>5 Mins</option>
                <option value={10}>10 Mins</option>
              </select>
              <p className="mt-2 text-[11px] text-slate-400">
                Time reserved after the interview ends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimingPreferencesSection;

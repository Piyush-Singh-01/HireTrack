import React from "react";

/**
 * CalendarIntegrationSection Component
 * 
 * Section 2 of Meeting Settings:
 * Allows recruiters to configure:
 * 1. Google Calendar connection status & OAuth account
 * 2. Preferred meeting platform (Google Meet, Zoom, Teams, Other)
 * 3. Default calendar view layout (Week, Day, Month)
 * 4. Google Calendar sync trigger
 */
const CalendarIntegrationSection = ({
  form,
  setForm,
  isCalendarConnected,
  connectedUser,
  profileLoading,
  connectCalendar,
}) => {
  const controlClass =
    "w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  return (
    <section className="group overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)] transition duration-300 hover:shadow-[0_14px_38px_rgba(30,41,59,0.08)]">
      {/* Section Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-white via-[#f8fffd] to-[#f2fbf9] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
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
                d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h2m2 0h2m-6 3h2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Calendar integration
              </h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                02 / 02
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Connect Google Calendar and choose your preferred meeting setup.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-xs font-medium text-emerald-700 sm:inline-flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Calendar connection
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        {/* 1. Google Calendar Connection status card */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 ${
            isCalendarConnected
              ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-50"
              : "border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50"
          }`}
        >
          <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/70 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3.5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isCalendarConnected
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    d="M7 10.5h10M7 14h6M6 4.5h12A2.5 2.5 0 0 1 20.5 7v10a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 17V7A2.5 2.5 0 0 1 6 4.5Z"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">Google Calendar</p>
                {!profileLoading && isCalendarConnected && connectedUser && (
                  <p className="mt-1 break-all text-xs text-slate-500">
                    Connected as {connectedUser.email}
                  </p>
                )}
                {!profileLoading && !isCalendarConnected && (
                  <p className="mt-1 text-xs text-slate-500">
                    Connect your account to keep your interview schedule aligned.
                  </p>
                )}
              </div>
            </div>

            <div
              className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border bg-white/90 px-3.5 py-2 shadow-sm ${
                isCalendarConnected ? "border-emerald-200" : "border-amber-200"
              }`}
            >
              {profileLoading ? (
                <>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                  <span className="text-xs font-bold text-slate-500">
                    Loading status
                  </span>
                </>
              ) : (
                <>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isCalendarConnected
                        ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
                        : "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]"
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      isCalendarConnected ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {isCalendarConnected ? "Connected" : "Not connected"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 2. Platform & Calendar View Selects */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Meeting Platform */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    d="M4 7.5h16M7 4.5v6m10-6v6M5 12h14v7H5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <label className="text-sm font-bold text-slate-800">
                Meeting platform
              </label>
            </div>
            <select
              className={controlClass}
              value={form.meetingPlatform}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, meetingPlatform: e.target.value }))
              }
            >
              <option value="">Select platform</option>
              <option value="Google Meet">Google Meet</option>
              <option value="Zoom">Zoom</option>
              <option value="Teams">Teams</option>
              <option value="Other">Other</option>
            </select>
            <p className="mt-2 text-[11px] text-slate-400">
              Choose the platform used for your interviews.
            </p>
          </div>

          {/* Default Calendar View */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect x="4" y="4.5" width="16" height="15" rx="2" />
                  <path d="M4 9h16M9 9v10m6-10v10" />
                </svg>
              </span>
              <label className="text-sm font-bold text-slate-800">
                Default calendar view
              </label>
            </div>
            <select
              className={controlClass}
              value={form.defaultCalendarView}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  defaultCalendarView: e.target.value,
                }))
              }
            >
              <option value="Week">Week</option>
              <option value="Day">Day</option>
              <option value="Month">Month</option>
            </select>
            <p className="mt-2 text-[11px] text-slate-400">
              Set the calendar layout you prefer to open.
            </p>
          </div>
        </div>

        {/* 3. Connect Google Calendar Button Card */}
        <div className="flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-[#f6f7ff] via-white to-[#f0fdfa] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Sync your schedule</p>
              <p className="mt-1 max-w-lg text-xs leading-5 text-slate-500">
                Link your Google Calendar to coordinate interview availability in one place.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={connectCalendar}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.07)] ring-1 ring-slate-200 transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-600 hover:text-white hover:ring-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 sm:w-auto"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt=""
              className="h-5 w-5"
            />
            Connect Google Calendar
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                d="M5 12h14m-6-6 6 6-6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CalendarIntegrationSection;

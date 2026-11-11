import React, { useEffect, useMemo, useState } from "react";
import useMeetingSettings from "../../hooks/useMeetingsettings";
import useGoogleCalendar from "../../hooks/useGoogleCalendar";
import { useGetProfile } from "../../hooks/settings/useGetProfile";
import { useToast } from "../../utils/ToastContext";
import TimingPreferencesSection from "../../component/setting/TimingPreferencesSection";
import CalendarIntegrationSection from "../../component/setting/CalendarIntegrationSection";


const MeetingSettingsPage = () => {
  const { showToast } = useToast();

  // API hooks for settings and Google calendar
  const { current, loading, updateItem, createItem } = useMeetingSettings();
  const { connectCalendar } = useGoogleCalendar();
  const { data: profileData, isLoading: profileLoading } = useGetProfile();

  // Form state
  const [form, setForm] = useState({
    defaultInterviewDuration: "60",
    meetingPlatform: "",
    maxInterviewPerDay: "3",
    allowRescheduling: false,
    calendarIntegration: "Google Calendar",
    defaultCalendarView: "Week",
    autoRecord: false,
    requireConsent: false,
    interviewTimings: {
      startBefore: 5,
      endAfter: 5,
    },
  });

  // Custom duration & capacity states
  const [isCustom, setIsCustom] = useState(false);
  const [customHrs, setCustomHrs] = useState("");
  const [customMins, setCustomMins] = useState("");
  const [isCustomMax, setIsCustomMax] = useState(false);
  const [customMaxVal, setCustomMaxVal] = useState("");

  // Set page document title
  useEffect(() => {
    document.title = "Meeting & Calendar Settings | Talent OS";
  }, []);

  // Helper: map backend payload to form state
  const mapFromBackend = (data) => ({
    defaultInterviewDuration: String(data?.defaultInterviewDuration ?? "60"),
    meetingPlatform: data?.meetingPlatform || "",
    maxInterviewPerDay: String(data?.maxInterviewPerDay ?? "3"),
    allowRescheduling: Boolean(data?.allowRescheduling),
    calendarIntegration: data?.calendarIntegration || "Google Calendar",
    defaultCalendarView: data?.defaultCalendarView || "Week",
    autoRecord: Boolean(data?.autoRecord),
    requireConsent: Boolean(data?.requireConsent),
    interviewTimings: {
      startBefore: data?.interviewTimings?.startBefore ?? 5,
      endAfter: data?.interviewTimings?.endAfter ?? 5,
    },
  });

  // Helper: map form state to backend payload
  const mapToBackend = (state) => ({
    defaultInterviewDuration: Number(state.defaultInterviewDuration),
    meetingPlatform: state.meetingPlatform,
    maxInterviewPerDay: Number(state.maxInterviewPerDay),
    allowRescheduling: Boolean(state.allowRescheduling),
    calendarIntegration: state.calendarIntegration,
    defaultCalendarView: state.defaultCalendarView,
    autoRecord: Boolean(state.autoRecord),
    requireConsent: Boolean(state.requireConsent),
    interviewTimings: {
      startBefore: Number(state.interviewTimings.startBefore),
      endAfter: Number(state.interviewTimings.endAfter),
    },
  });

  // Load backend data into local form state
  useEffect(() => {
    if (current) {
      const mapped = mapFromBackend(current);
      setForm(mapped);

      // Check if duration is a custom number (not 30 or 60)
      const duration = Number(mapped.defaultInterviewDuration);
      if (duration !== 30 && duration !== 60 && duration !== 0) {
        setIsCustom(true);
        const hrs = Math.floor(duration / 60);
        const mins = duration % 60;
        setCustomHrs(hrs > 0 ? String(hrs) : "");
        setCustomMins(mins > 0 ? String(mins) : "");
      } else {
        setIsCustom(false);
      }

      // Check if max interviews is a custom number (not 3, 5, or 10)
      const maxInterviews = Number(mapped.maxInterviewPerDay);
      if (maxInterviews !== 3 && maxInterviews !== 5 && maxInterviews !== 10) {
        setIsCustomMax(true);
        setCustomMaxVal(String(maxInterviews));
      } else {
        setIsCustomMax(false);
      }
    }
  }, [current]);

  // Handle custom duration change (hours + minutes -> total minutes)
  const handleCustomDurationChange = (hrs, mins) => {
    const h = hrs === "" ? 0 : Number(hrs);
    const m = mins === "" ? 0 : Number(mins);
    const totalMinutes = h * 60 + m;
    setForm((prev) => ({
      ...prev,
      defaultInterviewDuration: String(totalMinutes),
    }));
  };

  // Determine Google Calendar connection status
  const isCalendarConnected = useMemo(() => {
    if (profileLoading) return false;
    return (
      profileData?.data?.googleCalendar?.isConnected === true ||
      profileData?.data?.isconnected === true ||
      profileData?.googleCalendar?.isConnected === true ||
      profileData?.isconnected === true
    );
  }, [profileData, profileLoading]);

  // Connected user email / info
  const connectedUser = useMemo(() => {
    if (!isCalendarConnected) return null;
    return (
      profileData?.data?.googleCalendar?.googleUser ||
      profileData?.googleCalendar?.googleUser ||
      null
    );
  }, [profileData, isCalendarConnected]);

  // Save handler
  const handleSave = async () => {
    try {
      const payload = mapToBackend(form);

      if (current?._id) {
        const res = await updateItem({ id: current._id, payload });
        showToast(
          res?.message || "Meeting settings updated successfully",
          "success"
        );
      } else {
        const res = await createItem(payload);
        showToast(
          res?.message || "Meeting settings created successfully",
          "success"
        );
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to save settings",
        "error"
      );
    }
  };

  return (
    <div className="min-h-full bg-[#f6f8fc] pb-10">
      {/* 1. Page Header & Banner */}
      <div className="px-4 pt-5 sm:px-6 lg:px-8 lg:pt-7">
        <div className="max-w-6xl">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-400 sm:text-sm">
            <span className="transition-colors hover:text-indigo-600">Settings</span>
            <svg
              className="h-3.5 w-3.5 text-slate-300"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.08 0Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold text-indigo-600">Meeting settings</span>
          </div>

          {/* Hero Banner */}
          <div className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#172554] via-[#263b83] to-[#4f46a5] px-6 py-7 shadow-[0_18px_50px_rgba(41,55,120,0.22)] sm:px-8 sm:py-8 lg:px-10">
            {/* <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border-[36px] border-white/[0.06]" />
            <div className="pointer-events-none absolute -bottom-36 right-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-300/10 blur-3xl" />
            <div className="pointer-events-none absolute right-16 top-8 -z-10 h-28 w-28 rounded-full bg-cyan-300/10 blur-2xl" /> */}

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-100 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
                  Workspace preferences
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[34px]">
                  Meeting settings
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100/80 sm:text-[15px]">
                  Fine-tune your interview schedule, set daily capacity, and keep your calendar in sync.
                </p>
              </div>

              {/* Quick Summary Badges */}
              <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                <div className="min-w-[132px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-100/70">
                    Interview length
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {Number(form.defaultInterviewDuration) >= 60
                      ? `${Math.floor(Number(form.defaultInterviewDuration) / 60)}h${
                          Number(form.defaultInterviewDuration) % 60
                            ? ` ${Number(form.defaultInterviewDuration) % 60}m`
                            : ""
                        }`
                      : `${form.defaultInterviewDuration || 0} min`}
                  </p>
                </div>
                <div className="min-w-[132px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-100/70">
                    Daily capacity
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {form.maxInterviewPerDay || "—"} interviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Sections */}
      <div className="w-full max-w-6xl space-y-6 px-4 pt-6 sm:px-6 lg:px-8 lg:pt-7">
        {/* Section 1: Duration, Daily Limit & Buffers */}
        <TimingPreferencesSection
          form={form}
          setForm={setForm}
          isCustom={isCustom}
          setIsCustom={setIsCustom}
          customHrs={customHrs}
          setCustomHrs={setCustomHrs}
          customMins={customMins}
          setCustomMins={setCustomMins}
          onCustomDurationChange={handleCustomDurationChange}
          isCustomMax={isCustomMax}
          setIsCustomMax={setIsCustomMax}
          customMaxVal={customMaxVal}
          setCustomMaxVal={setCustomMaxVal}
        />

        {/* Section 2: Calendar Integration & Platform View */}
        <CalendarIntegrationSection
          form={form}
          setForm={setForm}
          isCalendarConnected={isCalendarConnected}
          connectedUser={connectedUser}
          profileLoading={profileLoading}
          connectCalendar={connectCalendar}
        />

        {/* 3. Bottom Save Action Bar */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_6px_24px_rgba(15,23,42,0.035)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  d="M12 8v4l2.5 1.5M20 12a8 8 0 1 1-2.35-5.65"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 4v4h-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <p className="text-xs font-bold text-slate-700">
                All set with your preferences?
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Save your changes to update meeting settings.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(79,70,229,0.24)] transition duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:via-indigo-700 hover:to-violet-700 hover:shadow-[0_12px_24px_rgba(79,70,229,0.3)] focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
          >
            {loading ? "Saving..." : "Save Changes"}
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
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
    </div>
  );
};

export default MeetingSettingsPage;

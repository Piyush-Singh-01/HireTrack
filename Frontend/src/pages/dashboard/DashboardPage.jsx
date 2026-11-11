import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { LiaBusinessTimeSolid } from "react-icons/lia";
import { LuBriefcaseBusiness } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { MdOutlinePerson } from "react-icons/md";
import { useDashboardInfo } from "../../hooks/useDashboardInfo";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useViewApplicants } from "../../hooks/useViewApplicants";
import Dashboard from "../../component/dashboard/Dashboard";

/**
 * DashboardPage Component (Route: "/dashboard")
 *
 * Page Controller for the main Recruitment Dashboard:
 * - Sets document title
 * - Coordinates data fetching with useDashboardInfo and useAnalytics hooks
 * - Handles interview actions (start, reject, reschedule)
 * - Manages modal lifecycle and feedback toasts
 * - Delegates pure UI rendering to the Dashboard presentational component
 */
const DashboardPage = () => {
  const [position, setPosition] = useState("All Positions");
  const [selected, setSelected] = useState("Sort By");
  const [activeIndex, setActiveIndex] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [toast, setToast] = useState(null);

  const filterTypeMap = {
    Today: "today",
    Tomorrow: "tomorrow",
    "This Week": "week",
    "This Month": "month",
    "Sort By": "today",
  };

  const {
    upcomingInterviewsQuery,
    completedInterviewsQuery,
    mergedTodaySchedules,
    candidatesInCurrentMonthQuery,
    candidatesInCurrentWeekQuery,
    inProcessQuery,
    shortlistedCandidatesQuery,
    rejectedCandidatesQuery,
    hiredCandidatesQuery,
    currentWeekHiredQuery,
    totalHiringManagersQuery,
    monthlyHiredQuery,
    candidateRates,
  } = useDashboardInfo(position, filterTypeMap[selected] || "today");

  const { interviewAnalyticsQuery } = useAnalytics(position);
  const { rejectCandidate, startInterview, rescheduleInterview } = useViewApplicants();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showViewDetail, setShowViewDetail] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showRejectModel, setShowRejectModel] = useState(false);

  // Reschedule state
  const [showReschedule, setSowReschedule] = useState(false);
  const [hour, setHour] = useState("01");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rescheduleDuration, setRescheduleDuration] = useState(30);
  const [sendNotification, setSendNotification] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = "Dashboard | HireTrack";
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const options = ["Today", "Tomorrow", "This Week", "This Month"];
  const isTodayView = selected === "Sort By" || selected === "Today";

  // Header date info
  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
      ? "Good afternoon"
      : "Good evening";
  const todayLabel = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Metric stats
  const stats = [
    {
      label: isTodayView ? "Interviews Today" : `Interviews ${selected}`,
      value: mergedTodaySchedules?.length || 0,
      sub: isTodayView ? "Scheduled" : selected,
      icon: <LiaBusinessTimeSolid />,
      details: [
        { label: "Upcoming", value: upcomingInterviewsQuery.data?.count },
        { label: "Completed", value: completedInterviewsQuery.data?.count },
      ],
    },
    {
      label: "Total Candidates",
      value: candidatesInCurrentMonthQuery.data?.count,
      sub: "This month",
      icon: <CgProfile />,
      details: [
        { label: "New this week", value: candidatesInCurrentWeekQuery.data?.count },
        { label: "In process", value: inProcessQuery.data?.count },
        { label: "Shortlisted", value: shortlistedCandidatesQuery.data?.count },
        { label: "Rejected", value: rejectedCandidatesQuery.data?.count },
        { label: "Hired", value: hiredCandidatesQuery.data?.count },
      ],
    },
    {
      label: "Offers Made",
      value: currentWeekHiredQuery.data?.count,
      sub: "This week",
      icon: <LuBriefcaseBusiness />,
    },
    {
      label: "Hiring Managers",
      value: totalHiringManagersQuery.data?.count,
      sub: "Total",
      icon: <MdOutlinePerson />,
    },
  ];

  // Chart 1: Time to hire
  const analyticsData = useMemo(() => {
    if (!monthlyHiredQuery.data?.roles || !monthlyHiredQuery.data?.month) return [];
    const { roles, month } = monthlyHiredQuery.data;
    return roles.map((role) => ({ name: role, value: month[role] || 0 }));
  }, [monthlyHiredQuery.data]);

  const shortLabelMap = useMemo(() => {
    if (!monthlyHiredQuery.data?.roles) return {};
    return monthlyHiredQuery.data.roles.reduce((acc, role) => {
      acc[role] = role.length > 10 ? role.split(" ").map((w) => w[0]).join("") : role;
      return acc;
    }, {});
  }, [monthlyHiredQuery.data]);

  // Chart 2: Conversion
  const conversionData = [
    { stage: "Applied", value: interviewAnalyticsQuery.data?.applied },
    { stage: "Selected", value: interviewAnalyticsQuery.data?.selected },
    { stage: "Hired", value: interviewAnalyticsQuery.data?.hired },
  ];

  // Chart 3: Candidate status
  const donutData = useMemo(() => {
    if (!candidateRates?.data?.chartData) return [];
    return candidateRates.data.chartData.map((item) => ({
      name: item.label,
      value: item.count,
      percentage: item.percentage,
    }));
  }, [candidateRates.data]);

  useEffect(() => {
    setActiveIndex(null);
  }, [position]);

  // Reschedule time parser
  const parseTimeSegments = (value) => {
    if (!value) return { h: "01", m: "00", p: "AM" };
    const ampmMatch = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (ampmMatch) {
      return {
        h: ampmMatch[1].padStart(2, "0"),
        m: ampmMatch[2],
        p: ampmMatch[3].toUpperCase(),
      };
    }
    const parts = value.split(":");
    if (parts.length >= 2) {
      const h24 = parseInt(parts[0], 10);
      const m = parts[1].slice(0, 2);
      const p = h24 >= 12 ? "PM" : "AM";
      let h12 = h24 % 12;
      h12 = h12 === 0 ? 12 : h12;
      return { h: String(h12).padStart(2, "0"), m, p };
    }
    return { h: "01", m: "00", p: "AM" };
  };

  useEffect(() => {
    if (selectedApplicant && showReschedule) {
      const timeStr = selectedApplicant.interviewTime || selectedApplicant.Time;
      const { h, m, p } = parseTimeSegments(timeStr);
      setHour(h);
      setMinute(m);
      setPeriod(p);
      const dateStr = selectedApplicant.interviewDate || selectedApplicant.date;
      setSelectedDate(dateStr ? new Date(dateStr) : new Date());
    }
  }, [selectedApplicant, showReschedule]);

  // Actions
  const handleReject = async () => {
    try {
      await rejectCandidate.mutateAsync({
        candidateId: selectedApplicant.candidateId,
        jobId: selectedApplicant.jobId,
        feedbackDescription: "--",
      });
      showToast("Candidate rejected successfully", "success");
      setShowRejectModel(false);
      queryClient.invalidateQueries(["dashboard-summary"]);
      queryClient.invalidateQueries(["todayInterviewSchedule"]);
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || error.message;

      if (status === 500 && msg?.toLowerCase().includes("error rejecting candidate")) {
        showToast(
          "Candidate appears rejected, but there was a non-critical backend issue (email). Status is refreshed.",
          "warning"
        );
        setShowRejectModel(false);
        queryClient.invalidateQueries(["candidates"]);
        return;
      }

      showToast(`Failed to reject candidate because: ${msg}`, "error");
      setShowRejectModel(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedApplicant) {
      showToast("No applicant selected.", "error");
      return;
    }
    if (!selectedApplicant?.jobId) {
      showToast("Missing jobId. Please navigate from the position page again.", "error");
      return;
    }

    const newDate =
      selectedDate instanceof Date ? selectedDate.toISOString().slice(0, 10) : selectedDate;
    const newTime = `${hour}:${minute} ${period}`;

    try {
      await rescheduleInterview.mutateAsync({
        jobId: selectedApplicant?.jobId,
        candidateId: selectedApplicant?.candidateId,
        candidateDetailsId: selectedApplicant?._id,
        applicant: selectedApplicant?.Candidate,
        scheduleId: selectedApplicant?.scheduleId,
        newDate,
        newTime,
        durationMinutes: rescheduleDuration,
      });
      setSowReschedule(false);
      setShowViewDetail(false);
    } catch (err) {
      console.error("[RescheduleInterview] error", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to schedule interview";
      showToast(`${msg}`, "error");
    }
  };

  const handleStartInterview = async () => {
    try {
      await startInterview.mutateAsync({
        applicantId: selectedApplicant.candidateId,
        interviewer: "Interviewer",
        applicant: selectedApplicant,
      });
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      showToast(`${msg}`, "error");
    }
    setShowStartConfirm(false);
  };

  const goToResume = (candidate, candidateId) =>
    navigate("/viewResume", {
      state: {
        jobId: selectedApplicant?.jobId,
        candidateId,
        candidate,
        from: "/dashboard",
      },
    });

  const goToFeedback = (candidate, candidateId) =>
    navigate("/feedback", {
      state: {
        status: selectedApplicant?.status,
        jobId: selectedApplicant?.jobId,
        candidate,
        candidateId,
        showFeedback: false,
      },
    });

  return (
    <Dashboard
      toast={toast}
      greeting={greeting}
      todayLabel={todayLabel}
      options={options}
      selected={selected}
      onSelectPeriod={setSelected}
      stats={stats}
      expanded={expanded}
      onToggleExpand={toggleExpand}
      interviewData={mergedTodaySchedules || []}
      isTodayView={isTodayView}
      onStartInterviewClick={(item) => {
        setSelectedApplicant(item);
        setShowStartConfirm(true);
      }}
      onDetailsClick={(item) => {
        setSelectedApplicant(item);
        setShowViewDetail(true);
      }}
      analyticsData={analyticsData}
      shortLabelMap={shortLabelMap}
      monthlyHiredQuery={monthlyHiredQuery}
      conversionData={conversionData}
      interviewAnalyticsQuery={interviewAnalyticsQuery}
      donutData={donutData}
      candidateRates={candidateRates}
      position={position}
      setPosition={setPosition}
      activeIndex={activeIndex}
      setActiveIndex={setActiveIndex}
      showStartConfirm={showStartConfirm}
      onCloseStartConfirm={() => setShowStartConfirm(false)}
      onConfirmStartInterview={handleStartInterview}
      showViewDetail={showViewDetail}
      selectedApplicant={selectedApplicant}
      onCloseViewDetail={() => setShowViewDetail(false)}
      onGoToResume={goToResume}
      onGoToFeedback={goToFeedback}
      onOpenReschedule={() => setSowReschedule(true)}
      onOpenReject={(applicant) => {
        setSelectedApplicant(applicant);
        setShowRejectModel(true);
        setShowViewDetail(false);
      }}
      showReschedule={showReschedule}
      onCloseReschedule={() => setSowReschedule(false)}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      hour={hour}
      setHour={setHour}
      minute={minute}
      setMinute={setMinute}
      period={period}
      setPeriod={setPeriod}
      rescheduleDuration={rescheduleDuration}
      setRescheduleDuration={setRescheduleDuration}
      sendNotification={sendNotification}
      setSendNotification={setSendNotification}
      onSaveReschedule={handleReschedule}
      isRescheduling={rescheduleInterview.isPending}
      showRejectModel={showRejectModel}
      onCloseReject={() => setShowRejectModel(false)}
      onConfirmReject={handleReject}
      isRejecting={rejectCandidate.isPending}
    />
  );
};

export default DashboardPage;

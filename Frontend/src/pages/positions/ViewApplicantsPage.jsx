import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useViewApplicants } from "../../hooks/useViewApplicants";
import { useViewDetails } from "../../hooks/useViewDetails";
import { getDisplayName } from "../../utils/getDisplayName";
import ViewApplicants from "../../component/position/candidatePage/ViewApplicants";

/**
 * ViewApplicantsPage Controller
 * Route: /viewApplicants
 * Manages applicants pipeline stages (Applied, Selected, Interview, On-Hold, Hired, Rejected),
 * candidate data normalization, interview scheduling, group discussions, auto-scheduling,
 * stage transition mutations, and modal state management.
 */
const ViewApplicantsPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const state = location.state || {};
  const queryJobId = searchParams.get("jobId");
  const queryStatus = searchParams.get("status");
  const queryTab = searchParams.get("tab");
  const storedJobId = typeof window !== "undefined" ? sessionStorage.getItem("jobId") : null;

  const jobId = props.jobId || state.jobId || queryJobId || storedJobId;
  const status = props.status || state.status || queryStatus || "Open";
  const initialTab = props.tab || state.tab || queryTab || "Applied";
  const incomingToast = props.newToast || state.newToast;

  // Active pipeline tab states
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeTab2, setActiveTab2] = useState("All");

  // Selection & filtering states
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Ratings");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Modal open/close states
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showScheduleGD, setShowScheduleGD] = useState(false);
  const [showAutoSchedule, setShowAutoSchedule] = useState(false);
  const [showRejectModel, setShowRejectModel] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showViewDetail, setShowViewDetail] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [extendDate, setExtendDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [selectedCandidateForOffer, setSelectedCandidateForOffer] = useState(null);

  // Form states for scheduling
  const [mode, setMode] = useState("Online");
  const [duration, setDuration] = useState(30);
  const [autoInterval, setAutoInterval] = useState(0);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);
  const [hour, setHour] = useState("01");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ---------- Page Title & Session Initialization ---------- */
  useEffect(() => {
    document.title = "Candidate Pipeline | Talent OS";

    if (jobId && typeof window !== "undefined") {
      try {
        sessionStorage.setItem("jobId", jobId);
      } catch (_) {}
    }
  }, [jobId]);

  useEffect(() => {
    if (initialTab) {
      if (status === "Closed") {
        setActiveTab2(initialTab);
      } else {
        setActiveTab(initialTab);
      }
    }
    if (incomingToast) {
      showToast(incomingToast.message, incomingToast.type);
      navigate(location.pathname, {
        replace: true,
        state: { ...location.state, newToast: null },
      });
    }
  }, [initialTab, status]);

  /* ---------- Data Fetching Hooks ---------- */
  const {
    data,
    loading,
    error,
    rejectCandidate,
    scheduleInterview,
    extendJobDate,
    closeJob,
    scheduleGD,
  } = useViewApplicants();

  const {
    jobDescription,
    isLoading: isPositionLoading,
    error: positionError,
    refetch: refetchJobDetails,
  } = useViewDetails(jobId);

  /* ---------- Redux Auth & Role Check ---------- */
  const { username, role, userId, user } = useSelector((s) => s.auth);
  const authUserId = userId || user?.id || user?._id || "";
  const authRole = role || user?.role || user?.Role || "";
  const isInterviewer = authRole === "Interviewer";

  const currentUser = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }, []);

  const isHiringManagerForThisJob = useMemo(() => {
    if (!isInterviewer) return true;
    if (!jobDescription) return false;
    return (
      (jobDescription.hiringManagers || []).some(
        (hm) => String(hm.userId || hm) === String(authUserId)
      ) ||
      String(jobDescription.hiringManager?.userId || jobDescription.hiringManager) ===
        String(authUserId)
    );
  }, [isInterviewer, jobDescription, authUserId]);

  /* ---------- Candidate Pipeline Lists Normalization ---------- */
  const applied = useMemo(
    () => (Array.isArray(data?.applied) ? data.applied : []),
    [data?.applied]
  );
  const selected = useMemo(
    () => (Array.isArray(data?.shortlisted) ? data.shortlisted : []),
    [data?.shortlisted]
  );

  const interviews = useMemo(() => {
    const map = new Map();
    [...(data?.interview || []), ...(data?.rescheduled || [])].forEach((c) => {
      map.set(c.applicationId, c);
    });

    const uniqueInterviews = Array.from(map.values());
    const groupedMap = new Map();

    uniqueInterviews.forEach((c) => {
      if (c.scheduleType === "Group Interview") {
        const key = `GD_${c.interviewDate}_${c.interviewTime}`;
        if (groupedMap.has(key)) {
          const existing = groupedMap.get(key);
          const newName = c.name || c.fullName || c.candidateName || "";
          if (newName) {
            existing.name = existing.name + ", " + newName;
          }
          if (!existing.groupedIds) {
            existing.groupedIds = [existing.applicationId, c.applicationId];
            existing.allApplications = [existing, c];
          } else {
            existing.groupedIds.push(c.applicationId);
            existing.allApplications.push(c);
          }
        } else {
          groupedMap.set(key, {
            ...c,
            groupedIds: [c.applicationId],
            allApplications: [c],
          });
        }
      } else {
        groupedMap.set(c.applicationId, c);
      }
    });

    return Array.from(groupedMap.values());
  }, [data?.interview, data?.rescheduled]);

  const onHold = useMemo(
    () => (Array.isArray(data?.onhold) ? data.onhold : []),
    [data?.onhold]
  );
  const hired = useMemo(
    () => (Array.isArray(data?.hired) ? data.hired : []),
    [data?.hired]
  );
  const rejectArr = useMemo(
    () => (Array.isArray(data?.rejected) ? data.rejected : []),
    [data?.rejected]
  );

  const All = useMemo(() => {
    const shortlisted = Array.isArray(data?.shortlisted) ? data.shortlisted : [];
    const rejected = Array.isArray(data?.rejected) ? data.rejected : [];
    const hiredData = Array.isArray(data?.hired) ? data.hired : [];
    return [
      ...shortlisted.map((x) => ({ ...x, Status: "Selected" })),
      ...rejected.map((x) => ({ ...x, Status: "Rejected" })),
      ...hiredData.map((x) => ({ ...x, Status: "Hired" })),
    ];
  }, [data?.shortlisted, data?.rejected, data?.hired]);

  const rejectedClosed = useMemo(
    () =>
      Array.isArray(data?.rejected)
        ? data.rejected.map((x) => ({ ...x, Status: "Rejected" }))
        : [],
    [data?.rejected]
  );

  const getApplicantId = (a) => a.id || a._id || a.applicationId;

  const selectedCandidates = useMemo(
    () => selected.filter((a) => selectedRows.includes(getApplicantId(a))),
    [selectedRows, selected]
  );

  const selectedInterviewForReschedule = useMemo(() => {
    if (!selectedApplicant) return null;
    return {
      _id: selectedApplicant.scheduleId || selectedApplicant.id || selectedApplicant._id,
      scheduleId: selectedApplicant.scheduleId || null,
      jobId: jobId || selectedApplicant.jobId || null,
      candidateId:
        selectedApplicant.candidateId ||
        selectedApplicant.applicationId ||
        selectedApplicant.id ||
        null,
      candidateDetailsId: selectedApplicant.candidateDetailsId || null,
      name:
        selectedApplicant.name ||
        selectedApplicant.fullName ||
        selectedApplicant.candidateName ||
        "-",
      position:
        selectedApplicant.position ||
        selectedApplicant.jobTitle ||
        jobDescription?.jobTitle ||
        "-",
      recruiter:
        selectedApplicant.recruiterName ||
        selectedApplicant.recruiter ||
        getDisplayName(currentUser) ||
        "-",
      date: selectedApplicant.interviewDate || selectedApplicant.date || null,
      time: selectedApplicant.interviewTime || selectedApplicant.time || null,
      meetingMode: selectedApplicant.meetingMode || selectedApplicant.mode || "Online",
      mode: selectedApplicant.meetingMode || selectedApplicant.mode || "Online",
      scheduleType: selectedApplicant.scheduleType || "Interview",
    };
  }, [selectedApplicant, jobId, jobDescription?.jobTitle, currentUser]);

  /* ---------- Row Checkbox Handlers ---------- */
  const handleCheckboxChange = (rowId) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  const handleSelectAll = (allIds) => {
    if (selectedRows.length === allIds.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows([...allIds]);
    }
  };

  /* ---------- Reject Candidate Action ---------- */
  const handleRejectCandidate = async () => {
    setShowRejectModel(false);

    const isDirectRejectTab =
      activeTab === "Applied" || activeTab === "Selected" || activeTab === "Interview";

    if (isDirectRejectTab) {
      try {
        const res = await rejectCandidate.mutateAsync({
          candidateId: selectedApplicant.id,
          feedbackDescription: "--",
        });
        showToast(res?.message || "Candidate rejected successfully", "success");
      } catch (err) {
        const msg = err?.response?.data?.message || err.message;
        showToast(`Failed to reject candidate: ${msg}`, "error");
      }
    } else {
      navigate(`/feedback`, {
        state: {
          status,
          jobId,
          tab: status === "Closed" ? activeTab2 : activeTab,
          candidate: selectedApplicant,
          candidateId: selectedApplicant.id,
          showFeedback: false,
          directReject: true,
        },
      });
    }
  };

  /* ---------- Schedule Single Interview Action ---------- */
  const handleScheduleSubmit = async () => {
    if (!selectedApplicant || !jobId) {
      showToast("Missing candidate or job", "error");
      return;
    }
    try {
      const res = await scheduleInterview.mutateAsync({
        jobId,
        candidateId: selectedApplicant.applicationId,
        recruiterName:
          getDisplayName(currentUser) !== "Unknown"
            ? getDisplayName(currentUser)
            : username || "HR",
        interviewDate: selectedDate
          ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
          : null,
        interviewTime: `${hour}:${minute} ${period}`,
        meetingMode: mode,
        durationMinutes: duration,
        sendNotification,
      });

      showToast(res?.message || "Interview scheduled successfully", "success");
      setActiveTab("Interview");
      setShowSchedule(false);
      queryClient.refetchQueries({ queryKey: ["schedules"] });
      queryClient.refetchQueries(["candidates", jobId]);
    } catch (err) {
      const errorData = err?.response?.data;
      const msg = errorData?.message || err.message;
      showToast(`Failed to schedule interview: ${msg}`, "error");
    }
  };

  /* ---------- Schedule GD Action ---------- */
  const handleScheduleGDSubmit = async () => {
    try {
      const res = await scheduleGD.mutateAsync({
        candidateIds: selectedCandidates.map((c) => getApplicantId(c)),
        recruiterName:
          getDisplayName(currentUser) !== "Unknown"
            ? getDisplayName(currentUser)
            : username || "HR",
        interviewDate: selectedDate
          ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
          : null,
        interviewTime: `${hour}:${minute} ${period}`,
        durationMinutes: duration,
        meetingMode: mode,
        sendNotification: true,
      });

      showToast(res?.message || "Group Discussion scheduled successfully", "success");
      setShowScheduleGD(false);
      setSelectedRows([]);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to schedule GD";
      showToast(`${msg}`, "error");
    }
  };

  /* ---------- Auto-Schedule Action ---------- */
  const handleAutoScheduleSubmit = async () => {
    try {
      setIsAutoScheduling(true);

      const baseDate = new Date(selectedDate);
      let h = parseInt(hour, 10);
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      baseDate.setHours(h, parseInt(minute, 10), 0, 0);

      let successCount = 0;
      const errors = [];

      for (let i = 0; i < selectedCandidates.length; i++) {
        const candidate = selectedCandidates[i];
        const currentSlot = new Date(baseDate.getTime() + i * (duration + autoInterval) * 60000);

        const slotH = currentSlot.getHours();
        const slotM = String(currentSlot.getMinutes()).padStart(2, "0");
        const slotPeriod = slotH >= 12 ? "PM" : "AM";
        let displayH = slotH % 12;
        if (displayH === 0) displayH = 12;
        const formattedTime = `${String(displayH).padStart(2, "0")}:${slotM} ${slotPeriod}`;

        const yyyy = currentSlot.getFullYear();
        const mm = String(currentSlot.getMonth() + 1).padStart(2, "0");
        const dd = String(currentSlot.getDate()).padStart(2, "0");
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        try {
          const res = await scheduleInterview.mutateAsync({
            jobId,
            candidateId: getApplicantId(candidate),
            recruiterName:
              getDisplayName(currentUser) !== "Unknown"
                ? getDisplayName(currentUser)
                : username || "HR",
            interviewDate: formattedDate,
            interviewTime: formattedTime,
            meetingMode: mode,
            durationMinutes: duration,
            sendNotification,
          });
          if (res?.message && res.message.toLowerCase().includes("email failed")) {
            errors.push(`${candidate.name || "Candidate"}: Email failed`);
          }
          successCount++;
        } catch (err) {
          const msg = err?.response?.data?.message || err?.message || "Error scheduling";
          errors.push(`${candidate.name || "Candidate"}: ${msg}`);
        }
      }

      setIsAutoScheduling(false);
      if (successCount > 0) {
        showToast(
          `Successfully scheduled ${successCount} interview(s)${errors.length > 0 ? " with some issues." : ""}`,
          "success"
        );
        if (errors.length > 0) {
          setTimeout(() => showToast(`Issues: ${errors.join(", ")}`, "error"), 3000);
        }
        setShowAutoSchedule(false);
        setSelectedRows([]);
        queryClient.refetchQueries({ queryKey: ["schedules"] });
        queryClient.refetchQueries(["candidates", jobId]);
      } else {
        showToast("Failed to schedule interviews", "error");
      }
      queryClient.invalidateQueries(["all-schedules"]);
    } catch (err) {
      setIsAutoScheduling(false);
      showToast("Failed to process auto-scheduling", "error");
    }
  };

  /* ---------- Extend Date Action ---------- */
  const handleExtendDateSubmit = async () => {
    if (!jobId || !selectedDate) {
      showToast("Missing job or date", "error");
      return;
    }
    try {
      await extendJobDate.mutateAsync({
        jobId,
        closingDate: selectedDate.toISOString().slice(0, 10),
      });
      setExtendDate(false);
      showToast("Job date extended successfully", "success");
    } catch (err) {
      showToast("Failed to extend job date", "error");
    }
  };

  /* ---------- Close Job Action ---------- */
  const handleCloseJobSubmit = async () => {
    if (!jobId) {
      showToast("Missing jobId", "error");
      return;
    }
    try {
      await closeJob.mutateAsync({ jobId });
      setShowClose(false);
      navigate("/positions");
    } catch (err) {
      showToast("Failed to close job", "error");
      setShowClose(false);
    }
  };

  /* ---------- Navigation Actions ---------- */
  const handleBack = () => {
    navigate("/positions");
  };

  const handleDetails = () => {
    navigate("/viewDetails", { state: { status, jobId } });
  };

  const handleOpenResume = (candidate, candidateId) => {
    navigate("/viewResume", {
      state: {
        status,
        jobId,
        tab: status === "Closed" ? activeTab2 : activeTab,
        candidateId,
        candidate,
      },
    });
  };

  const handleOpenReview = (candidate, candidateId, showFeedbackFlag = true) => {
    navigate("/feedback", {
      state: {
        status,
        jobId,
        tab: status === "Closed" ? activeTab2 : activeTab,
        candidate,
        candidateId,
        showFeedback: showFeedbackFlag,
      },
    });
  };

  const handleSendOffer = (candidate) => {
    if (!jobDescription?.joiningInstructions) {
      setSelectedCandidateForOffer(candidate);
      setIsInstructionsModalOpen(true);
    } else {
      navigate("/selecttemplate", { state: { candidate, jobId, status } });
    }
  };

  return (
    <ViewApplicants
      jobId={jobId}
      status={status}
      jobDescription={jobDescription}
      isPositionLoading={isPositionLoading}
      positionError={positionError}
      refetchJobDetails={refetchJobDetails}
      isHiringManagerForThisJob={isHiringManagerForThisJob}
      currentUser={currentUser}
      username={username}
      // Pipeline lists
      applied={applied}
      selected={selected}
      interviews={interviews}
      onHold={onHold}
      hired={hired}
      rejectArr={rejectArr}
      All={All}
      rejectedClosed={rejectedClosed}
      // Loading & errors
      loading={loading}
      error={error}
      // Tabs & filtering
      activeTab={activeTab}
      onTabChange={setActiveTab}
      activeTab2={activeTab2}
      onTab2Change={setActiveTab2}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      sortConfig={sortConfig}
      onSortChange={setSortConfig}
      // Selection
      selectedRows={selectedRows}
      onCheckboxChange={handleCheckboxChange}
      onSelectAll={handleSelectAll}
      selectedCandidates={selectedCandidates}
      // Modals
      selectedApplicant={selectedApplicant}
      onSelectApplicant={setSelectedApplicant}
      showSchedule={showSchedule}
      onToggleSchedule={setShowSchedule}
      showReschedule={showReschedule}
      onToggleReschedule={setShowReschedule}
      selectedInterviewForReschedule={selectedInterviewForReschedule}
      showScheduleGD={showScheduleGD}
      onToggleScheduleGD={setShowScheduleGD}
      showAutoSchedule={showAutoSchedule}
      onToggleAutoSchedule={setShowAutoSchedule}
      showRejectModel={showRejectModel}
      onToggleRejectModel={setShowRejectModel}
      showStartConfirm={showStartConfirm}
      onToggleStartConfirm={setShowStartConfirm}
      showViewDetail={showViewDetail}
      onToggleViewDetail={setShowViewDetail}
      showClose={showClose}
      onToggleClose={setShowClose}
      extendDate={extendDate}
      onToggleExtendDate={setExtendDate}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      isInstructionsModalOpen={isInstructionsModalOpen}
      onToggleInstructionsModal={setIsInstructionsModalOpen}
      selectedCandidateForOffer={selectedCandidateForOffer}
      // Schedule form inputs
      mode={mode}
      onModeChange={setMode}
      duration={duration}
      onDurationChange={setDuration}
      autoInterval={autoInterval}
      onAutoIntervalChange={setAutoInterval}
      isAutoScheduling={isAutoScheduling}
      sendNotification={sendNotification}
      onSendNotificationChange={setSendNotification}
      hour={hour}
      onHourChange={setHour}
      minute={minute}
      onMinuteChange={setMinute}
      period={period}
      onPeriodChange={setPeriod}
      // API Mutations
      onRejectConfirm={handleRejectCandidate}
      onScheduleSubmit={handleScheduleSubmit}
      isSchedulePending={scheduleInterview.isPending}
      onScheduleGDSubmit={handleScheduleGDSubmit}
      isScheduleGDPending={scheduleGD.isPending}
      onAutoScheduleSubmit={handleAutoScheduleSubmit}
      onExtendDateSubmit={handleExtendDateSubmit}
      isExtendDatePending={extendJobDate.isPending}
      onCloseJobSubmit={handleCloseJobSubmit}
      isCloseJobPending={closeJob.isPending}
      // Navigation
      onBack={handleBack}
      onDetails={handleDetails}
      onOpenResume={handleOpenResume}
      onOpenReview={handleOpenReview}
      onSendOffer={handleSendOffer}
      // Toast
      toast={toast}
      showToast={showToast}
      queryClient={queryClient}
      {...props}
    />
  );
};

export default ViewApplicantsPage;

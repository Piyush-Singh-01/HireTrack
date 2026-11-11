import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useFeedback } from "../../hooks/useFeedback";
import { useViewDetails } from "../../hooks/useViewDetails";
import { getDisplayName } from "../../utils/getDisplayName";
import Feedback from "../../component/position/candidatePage/Feedback";

/**
 * FeedbackPage Controller
 * Route: /feedback
 * Manages interview feedback scorecard, competency ratings across skills,
 * qualitative interview notes, candidate decision actions (Hire, On-Wait, Reject),
 * reschedule modal flows, and role-based permissions.
 */
const FeedbackPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const jobId = props.jobId || state.jobId;
  const status = props.status || state.status;
  const tab = props.tab || state.tab;
  const propCandidate = props.candidate || state.candidate;
  const isDirectReject = Boolean(state.directReject);

  // Hook for feedback scorecard state and mutations
  const {
    candidate: hookCandidate,
    ratings,
    comments,
    setComments,
    updateRating,
    submitFeedback,
    showFeedback: hookShowFeedback,
    feedbackMutate,
    shortlist,
    reject,
  } = useFeedback();

  const candidate = propCandidate || hookCandidate;
  const showFeedback =
    typeof state.showFeedback === "boolean" ? state.showFeedback : hookShowFeedback;

  // View Details for position description & hiring team
  const { jobDescription } = useViewDetails(jobId);

  // Redux auth selectors
  const role = useSelector(
    (s) => s.auth.role || s.auth.user?.role || s.auth.user?.Role || ""
  );
  const authUserId = useSelector(
    (s) => s.auth.userId || s.auth.user?.id || s.auth.user?._id || ""
  );
  const isInterviewer = role === "Interviewer";

  const currentUser = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }, []);

  const isHiringManagerForThisJob = useMemo(() => {
    if (!jobDescription) return true;
    if (!isInterviewer) return true;
    const hms = jobDescription.hiringManagers || [];
    const isHMArray = hms.some((hm) => String(hm.userId || hm) === String(authUserId));
    const isHMSingle =
      String(jobDescription.hiringManager?.userId || jobDescription.hiringManager) ===
      String(authUserId);
    return isHMArray || isHMSingle;
  }, [jobDescription, isInterviewer, authUserId]);

  // Form decision state
  const [newStatus, setNewStatus] = useState(isDirectReject ? "rejected" : "");
  const [showReschedule, setShowReschedule] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  /* ---------- Candidate Display Formatting ---------- */
  const candidateDisplayName =
    candidate?.name ||
    candidate?.fullName ||
    candidate?.candidateName ||
    "Candidate";

  const candidateDisplayPosition =
    candidate?.position ||
    candidate?.jobTitle ||
    jobDescription?.jobTitle ||
    "Role Position";

  useEffect(() => {
    document.title = candidateDisplayName
      ? `Evaluation: ${candidateDisplayName} | Talent OS`
      : "Interview Feedback & Scorecard | Talent OS";
  }, [candidateDisplayName]);

  const initials = useMemo(() => {
    const parts = candidateDisplayName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return candidateDisplayName.slice(0, 2).toUpperCase() || "CA";
  }, [candidateDisplayName]);

  const formattedInterviewDate = useMemo(() => {
    const rawDate =
      candidate?.interviewSchedule?.interviewDate ||
      candidate?.date ||
      (candidate?.lastUpdated ? candidate.lastUpdated : null);

    if (!rawDate) return "Pending Schedule";
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return String(rawDate);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return String(rawDate);
    }
  }, [candidate]);

  const formattedInterviewTime = useMemo(() => {
    const rawTime =
      candidate?.interviewSchedule?.interviewTime ||
      candidate?.time ||
      (candidate?.lastUpdated
        ? new Date(candidate.lastUpdated).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "");
    return rawTime || "Time TBD";
  }, [candidate]);

  const selectedInterviewForReschedule = useMemo(() => {
    if (!candidate) return null;

    const schedId =
      candidate.scheduleId ||
      candidate.interviewSchedule?.scheduleId ||
      candidate.rescheduledInfo?.scheduleId ||
      null;

    const detId =
      candidate.candidateDetailsId ||
      candidate.interviewSchedule?._id ||
      candidate.rescheduledInfo?._id ||
      null;

    const cId =
      candidate.applicationId ||
      candidate.id ||
      candidate.candidateId ||
      candidate._id;

    return {
      _id: detId || cId,
      scheduleId: schedId,
      jobId: jobId || candidate.jobId || null,
      candidateId: cId,
      candidateDetailsId: detId,
      name:
        candidate.name ||
        candidate.fullName ||
        candidate.candidateName ||
        "-",
      position:
        candidate.position ||
        candidate.jobTitle ||
        jobDescription?.jobTitle ||
        "-",
      recruiter:
        candidate.recruiterName ||
        candidate.recruiter ||
        getDisplayName(currentUser) ||
        "-",
      date: candidate.interviewDate || candidate.date || null,
      time: candidate.interviewTime || candidate.time || null,
      scheduleType: candidate.scheduleType || "Interview",
    };
  }, [candidate, jobId, currentUser, jobDescription]);

  /* Grouped candidate summary for cleaner prop flow */
  const candidateInfo = useMemo(
    () => ({
      name: candidateDisplayName,
      position: candidateDisplayPosition,
      initials,
      interviewDate: formattedInterviewDate,
      interviewTime: formattedInterviewTime,
      recruiter: selectedInterviewForReschedule?.recruiter || null,
      profileStatus: candidate?.profileStatus || null,
    }),
    [
      candidateDisplayName,
      candidateDisplayPosition,
      initials,
      formattedInterviewDate,
      formattedInterviewTime,
      selectedInterviewForReschedule?.recruiter,
      candidate?.profileStatus,
    ]
  );

  /* Loading states derived from mutations */
  const isSubmitting = feedbackMutate.isPending;
  const isActionPending =
    feedbackMutate.isPending || reject.isPending || shortlist.isPending;

  /* ---------- Actions & Submissions ---------- */
  const handleBack = () => {
    if (showFeedback) {
      navigate("/viewApplicants", {
        state: { jobId, status, tab },
      });
    } else {
      navigate(-1);
    }
  };

  const handleRejectFromOnHold = async () => {
    try {
      await submitFeedback({
        candidateFeedback: {
          communication: ratings.communication,
          technical: ratings.technical,
          programming: ratings.programming,
          problemSolving: ratings.problemSolving,
          feedbackDescription: comments,
        },
        newStatus: "rejected",
      });
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e.message ||
        "Failed to reject candidate";
      showToast(`${msg}`, "error");
    }
  };

  const handleHireFromOnHold = async () => {
    try {
      await submitFeedback({
        candidateFeedback: {
          communication: ratings.communication,
          technical: ratings.technical,
          programming: ratings.programming,
          problemSolving: ratings.problemSolving,
          feedbackDescription: comments,
        },
        newStatus: "hired",
      });
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e.message ||
        "Failed to hire candidate";
      showToast(`${msg}`, "error");
    }
  };

  const handleSubmitFinalDecision = async () => {
    if (!newStatus) {
      showToast("Please select status of candidate", "error");
      return;
    }

    try {
      const candidateFeedback = {
        ...ratings,
        feedbackDescription: comments,
      };
      await submitFeedback({
        candidateFeedback,
        newStatus,
      });
      showToast("Candidate Feedback successfully", "success");
    } catch (error) {
      showToast("Failed to submit feedback", "error");
    }
  };

  const handleRescheduleSuccess = () => {
    setShowReschedule(false);
    showToast("Interview rescheduled successfully!", "success");
    setTimeout(() => {
      navigate("/viewApplicants", {
        state: { jobId, status, tab: "Interview" },
      });
    }, 1000);
  };

  return (
    <Feedback
      candidateInfo={candidateInfo}
      ratings={ratings}
      updateRating={updateRating}
      comments={comments}
      setComments={setComments}
      newStatus={newStatus}
      setNewStatus={setNewStatus}
      showFeedback={showFeedback}
      isDirectReject={isDirectReject}
      isHiringManagerForThisJob={isHiringManagerForThisJob}
      isSubmitting={isSubmitting}
      isActionPending={isActionPending}
      showReschedule={showReschedule}
      selectedInterviewForReschedule={selectedInterviewForReschedule}
      onOpenReschedule={() => setShowReschedule(true)}
      onCloseReschedule={() => setShowReschedule(false)}
      onRescheduleSuccess={handleRescheduleSuccess}
      toast={toast}
      onBack={handleBack}
      onRejectFromOnHold={handleRejectFromOnHold}
      onHireFromOnHold={handleHireFromOnHold}
      onSubmitFinalDecision={handleSubmitFinalDecision}
    />
  );
};

export default FeedbackPage;

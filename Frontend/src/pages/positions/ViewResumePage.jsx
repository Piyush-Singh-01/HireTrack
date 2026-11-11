import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { pdfjs } from "react-pdf";
import { IoArrowBack } from "react-icons/io5";
import { useCandidateStatus } from "../../hooks/useCandidateStatus";
import { useViewDetails } from "../../hooks/useViewDetails";
import { axiosInstance } from "../../utils/AxiosInstance";
import { ApiRoutes } from "../../utils/ApiRoutes";
import Toast from "../../component/ui/Toast";
import { WarningIcon } from "../../component/position/candidatePage/viewResume/shared";
import {
  CandidateProfileHero,
  ApplicationDetails,
  ATSAnalysis,
  ResumeViewer,
  ConfirmationModals,
} from "../../component/position/candidatePage/viewResume";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

/* =========================================================
   Helpers for filtering & formatting candidate answers
   ========================================================= */

const HIDDEN_ANSWER_KEYS = new Set([
  "firstName",
  "middleName",
  "lastName",
  "address1",
  "address2",
  "city",
  "postalCode",
  "state",
  "country",
  "email",
  "contactNumber",
  "gender",
  "experienceLevel",
  "education",
  "experience",
  "skills",
  "attachments",
  "referralSource",
  "subscribe",
  "consent",
  "termsAccepted",
]);

const isFilled = (value) => {
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some((item) => isFilled(item));
  if (value && typeof value === "object") {
    return Object.values(value).some((item) => isFilled(item));
  }
  return value !== null && value !== undefined && String(value).trim() !== "";
};

const formatLabel = (key) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatValue = (value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.filter(isFilled).join(", ") || "-";
  if (value === null || value === undefined) return "-";
  const trimmed = String(value).trim();
  return trimmed || "-";
};

const buildFullName = (answers, fallbackName) => {
  const fullName = [answers?.firstName, answers?.middleName, answers?.lastName]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" ");
  return fullName || fallbackName || "-";
};

const buildAddress = (answers) =>
  [
    answers?.address1,
    answers?.address2,
    answers?.city,
    answers?.state,
    answers?.postalCode,
    answers?.country,
  ]
    .map((value) => (typeof value === "string" ? value.trim() : value))
    .filter(Boolean)
    .join(", ");

/**
 * ViewResumePage
 * Route: /viewResume
 *
 * Page controller that manages:
 * - Candidate data fetching & answer formatting
 * - AI resume analysis (fetch + trigger)
 * - Shortlist / Reject stage mutations
 * - Permission checks (hiring manager role)
 * - Navigation & page-level state
 *
 * Composes focused subcomponents for each visual section.
 */
const ViewResumePage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const jobId = props.jobId || state.jobId;
  const candidateId = props.candidateId || state.candidateId;
  const candidate = props.candidate || state.candidate;
  const status = props.status || state.status;
  const tab = props.tab || state.tab;
  const from = props.from || state.from;

  // AI Resume analysis states
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Modal states
  const [shortlist, setShortlist] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  /* ---------- Redux Auth & Role Check ---------- */
  const role = useSelector(
    (s) => s.auth.role || s.auth.user?.role || s.auth.user?.Role || ""
  );
  const authUserId = useSelector(
    (s) => s.auth.userId || s.auth.user?.id || s.auth.user?._id || ""
  );
  const isInterviewer = role === "Interviewer";

  /* ---------- Position Details Hook ---------- */
  const { jobDescription, error: positionError } = useViewDetails(jobId);

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

  /* ---------- Candidate Status & Details Hook ---------- */
  const { shortlistCandidate, rejectCandidate, getCanidatedetail } = useCandidateStatus(
    jobId,
    candidateId
  );
  const { data, isLoading, isError } = getCanidatedetail;
  const candidateDetails = data?.data;

  // Answer mappings
  const answers = useMemo(
    () => candidateDetails?.answers || candidate?.answers || {},
    [candidate?.answers, candidateDetails?.answers]
  );
  const attachments = answers?.attachments || [];
  const resumeUrl = attachments?.[0]?.url || attachments?.[0]?.fileUrl;

  const profileStatus =
    candidateDetails?.profileStatus || candidate?.profileStatus || "";
  const candidateName =
    candidateDetails?.candidateId?.name ||
    candidate?.name ||
    candidate?.fullName ||
    candidate?.Candidate ||
    "-";
  const displayName = buildFullName(answers, candidateName);
  const appliedRole =
    candidateDetails?.jobId?.jobTitle || jobDescription?.jobTitle || candidate?.Position || "-";
  const address = buildAddress(answers);
  const isApplied = profileStatus?.toLowerCase() === "applied";

  useEffect(() => {
    document.title = displayName && displayName !== "-"
      ? `Resume & Analysis: ${displayName} | Talent OS`
      : "Candidate Resume & AI Analysis | Talent OS";
  }, [displayName]);

  // Check connection error
  useEffect(() => {
    if (isError || positionError) {
      setConnectionError({
        message:
          "Cannot connect to server. Please ensure the backend server is running on port 3000.",
        type: "error",
      });
    } else {
      setConnectionError(null);
    }
  }, [isError, positionError]);

  /* ---------- AI Resume Analysis Fetch & Trigger ---------- */
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!candidateId) return;
      try {
        setLoadingAnalysis(true);
        setAnalysisError(null);
        const res = await axiosInstance.get(ApiRoutes.RESUME_ANALYSIS.GET(candidateId));
        if (res.data?.success && res.data?.data) {
          setAnalysis(res.data.data);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Failed to load resume analysis:", err);
          setAnalysisError("Failed to fetch analysis.");
        }
      } finally {
        setLoadingAnalysis(false);
      }
    };

    fetchAnalysis();
  }, [candidateId]);

  const handleAnalyzeResume = async () => {
    if (!candidateId || !resumeUrl) return;
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const res = await axiosInstance.post(ApiRoutes.RESUME_ANALYSIS.ANALYZE(candidateId));
      if (res.data?.success && res.data?.data) {
        setAnalysis(res.data.data);
        showToast("Resume analyzed successfully", "success");
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      console.error("Analysis trigger failed:", err);
      const errMsg =
        err.response?.data?.message || err.message || "Failed to analyze resume.";
      setAnalysisError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ---------- Form Answer Formatting ---------- */
  const formFieldLabels = useMemo(() => {
    const fields = candidateDetails?.formId?.fields || [];
    return fields.reduce((acc, field) => {
      if (field?.fieldId && field?.label) {
        acc[field.fieldId] = field.label;
      }
      return acc;
    }, {});
  }, [candidateDetails?.formId?.fields]);

  const primaryAnswers = useMemo(
    () =>
      [
        { label: "Full Name", value: displayName },
        {
          label: "Email",
          value: answers?.email || candidateDetails?.candidateId?.email || candidate?.email,
        },
        {
          label: "Contact Number",
          value:
            answers?.contactNumber ||
            candidateDetails?.candidateId?.mobile ||
            candidate?.mobile,
        },
        { label: "Gender", value: answers?.gender },
        { label: "Experience Level", value: answers?.experienceLevel },
        { label: "Referral Source", value: answers?.referralSource },
        { label: "Subscribed", value: answers?.subscribe },
        { label: "Consent Given", value: answers?.consent },
        { label: "Terms Accepted", value: answers?.termsAccepted },
        { label: "Address", value: address },
      ].filter((item) => isFilled(item.value)),
    [
      address,
      answers,
      candidate?.email,
      candidate?.mobile,
      candidateDetails?.candidateId?.email,
      candidateDetails?.candidateId?.mobile,
      displayName,
    ]
  );

  const customAnswers = useMemo(
    () =>
      Object.entries(answers)
        .filter(([k, value]) => !HIDDEN_ANSWER_KEYS.has(k) && isFilled(value))
        .map(([k, value]) => ({
          label: formFieldLabels[k] || formatLabel(k),
          value: formatValue(value),
        })),
    [answers, formFieldLabels]
  );

  const educationEntries = useMemo(
    () =>
      (Array.isArray(answers?.education) ? answers.education : []).filter((entry) =>
        isFilled(entry)
      ),
    [answers?.education]
  );

  const experienceEntries = useMemo(
    () =>
      (Array.isArray(answers?.experience) ? answers.experience : []).filter((entry) =>
        isFilled(entry)
      ),
    [answers?.experience]
  );

  const skills = useMemo(
    () =>
      (Array.isArray(answers?.skills) ? answers.skills : [])
        .map((skill) => (typeof skill === "string" ? skill.trim() : ""))
        .filter(Boolean),
    [answers?.skills]
  );

  /* ---------- Shortlist & Reject Mutations ---------- */
  const handleShortlistConfirm = async () => {
    if (!jobId) {
      showToast("Missing job ID. Please navigate from the position page.", "error");
      return;
    }
    if (!candidateId) {
      showToast("Missing candidate ID. Please try again.", "error");
      return;
    }
    try {
      await shortlistCandidate.mutate();
      setShortlist(false);
      showToast("Candidate shortlisted successfully", "success");
    } catch {
      showToast("Failed to shortlist candidate. Please try again.", "error");
    }
  };

  const handleOpenRejectModal = () => {
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    setShowRejectModal(false);
    if (!jobId || !candidateId) {
      showToast("Missing context for rejection.", "error");
      return;
    }

    const currentStatus = (
      candidateDetails?.profileStatus ||
      candidate?.profileStatus ||
      tab ||
      "Applied"
    ).toLowerCase();
    const isDirectReject = ["applied", "shortlisted", "selected", "interview"].includes(
      currentStatus
    );

    if (isDirectReject) {
      try {
        await rejectCandidate.mutate({ feedbackDescription: "--" });
      } catch (err) {
        showToast("Failed to reject candidate", "error");
      }
    } else {
      navigate(`/feedback`, {
        state: {
          status,
          jobId,
          tab: tab || "Applied",
          candidate: candidate || candidateDetails,
          candidateId,
          showFeedback: false,
          directReject: true,
        },
      });
    }
  };

  /* ---------- Navigation ---------- */
  const handleBack = () => {
    if (from) {
      navigate(from);
    } else if (jobId) {
      navigate("/viewApplicants", {
        state: {
          jobId,
          status: status || "Open",
          tab: tab || "Applied",
        },
      });
    } else {
      navigate(-1);
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-indigo-50/40 to-sky-50/50">
      <div className="max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        {toast && <Toast message={toast.message} type={toast.type} />}

        {/* Connection Error Banner */}
        {connectionError && (
          <div className="flex gap-4 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 p-6 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md">
              <WarningIcon />
            </div>
            <div className="min-w-0">
              <h3 className="mb-1 text-lg font-bold text-rose-800">Connection Error</h3>
              <p className="mb-3 text-sm text-rose-600">{connectionError.message}</p>
              <div className="space-y-2 text-sm text-rose-500">
                <p className="font-semibold">Possible solutions:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Start the backend server on port 3000</li>
                  <li>Check if the server is running and accessible</li>
                  <li>Verify there are no firewall or port conflicts</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Top Header Bar */}
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="rounded-full bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 transition-colors hover:text-blue cursor-pointer"
            >
              <IoArrowBack className="text-2xl" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                Candidates
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Candidate&apos;s Page
              </h1>
            </div>
          </div>
        </section>

        {/* Candidate Profile Hero */}
        <CandidateProfileHero
          displayName={displayName}
          appliedRole={appliedRole}
          profileStatus={profileStatus}
          isApplied={isApplied}
          isHiringManagerForThisJob={isHiringManagerForThisJob}
          onToggleShortlist={setShortlist}
          onOpenRejectModal={handleOpenRejectModal}
          isRejecting={rejectCandidate.isLoading}
        />

        {/* Shortlist & Reject Modals */}
        <ConfirmationModals
          shortlist={shortlist}
          onToggleShortlist={setShortlist}
          onShortlistConfirm={handleShortlistConfirm}
          isShortlisting={shortlistCandidate.isLoading}
          showRejectModal={showRejectModal}
          onToggleRejectModal={setShowRejectModal}
          onConfirmReject={handleConfirmReject}
          isRejecting={rejectCandidate.isLoading}
        />

        {/* Application Details */}
        <ApplicationDetails
          primaryAnswers={primaryAnswers}
          customAnswers={customAnswers}
          educationEntries={educationEntries}
          experienceEntries={experienceEntries}
          skills={skills}
          resumeUrl={resumeUrl}
          connectionError={connectionError}
        />

        {/* ATS Resume Analysis (only when resume exists) */}
        {resumeUrl && (
          <ATSAnalysis
            analysis={analysis}
            loadingAnalysis={loadingAnalysis}
            isAnalyzing={isAnalyzing}
            analysisError={analysisError}
            onAnalyzeResume={handleAnalyzeResume}
          />
        )}

        {/* Resume PDF Viewer */}
        <ResumeViewer
          resumeUrl={resumeUrl}
          isLoading={isLoading}
          connectionError={connectionError}
        />
      </div>
    </div>
  );
};

export default ViewResumePage;

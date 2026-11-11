import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useViewDetails } from "../../hooks/useViewDetails";
import { useGetOfferLetterTemplate } from "../../hooks/useOfferLetterTemplate";
import ViewDetials from "../../component/position/candidatePage/ViewDetials";

/**
 * PositionDetailsPage Controller
 * Route: /viewdetails
 * Manages position configuration data fetching, Redux auth role permissions,
 * shareable application link copying, onboarding instructions modal flow,
 * and page routing delegates.
 */
const PositionDetailsPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const state = location.state || {};
  const queryJobId = searchParams.get("jobId");
  const queryStatus = searchParams.get("status");
  const storedJobId = typeof window !== "undefined" ? sessionStorage.getItem("jobId") : null;

  const jobId = props.jobId || state.jobId || queryJobId || storedJobId;
  const status = props.status || state.status || queryStatus || "Open";

  const [copied, setCopied] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Set document title and persist jobId in sessionStorage
  useEffect(() => {
    document.title = "Position Details | Talent OS";

    if (jobId && typeof window !== "undefined") {
      try {
        sessionStorage.setItem("jobId", jobId);
      } catch (_) {}
    }
  }, [jobId]);

  // Data fetching hooks for position details and offer letter template
  const { jobDescription, isLoading, error, refetch } = useViewDetails(jobId);
  const { data: existingTemplate } = useGetOfferLetterTemplate(jobId);

  // Redux auth selectors for permissions
  const authRole = useSelector(
    (s) => s.auth.role || s.auth.user?.role || s.auth.user?.Role || ""
  );
  const authUserId = useSelector(
    (s) => s.auth.userId || s.auth.user?.id || s.auth.user?._id || ""
  );
  const isInterviewer = authRole === "Interviewer";

  // Check if current user is the hiring manager for this position
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

  /* ---------- Link formatting and copying ---------- */
  const getFullApplicationLink = (link) => {
    if (!link) return "";
    if (link.startsWith("http://") || link.startsWith("https://")) return link;
    const prefix = link.startsWith("/") ? "" : "/";
    return `${window.location.origin}${prefix}${link}`;
  };

  const handleCopyLink = () => {
    if (jobDescription?.applicationLink) {
      const fullLink = getFullApplicationLink(jobDescription.applicationLink);
      navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatMonthYear = (input) => {
    if (!input) return "Loading...";
    const dateObj = new Date(input);
    if (Number.isNaN(dateObj.getTime())) return "Loading...";
    return dateObj.toLocaleString(undefined, { month: "long", year: "numeric" });
  };

  /* ---------- Navigation & Action Delegates ---------- */
  const handleBack = () => {
    navigate("/positions");
  };

  const handleViewApplicants = () => {
    try {
      if (jobId && typeof window !== "undefined") {
        sessionStorage.setItem("jobId", jobId);
      }
    } catch (_) {}

    navigate("/viewApplicants", { state: { status, jobId } });
  };

  const handleActivate = () => {
    navigate("/viewApplicants", { state: { status, jobId, tab: "Applied" } });
  };

  const handleSendOfferLetter = () => {
    if (!jobDescription?.joiningInstructions) {
      setPendingAction("sendOffer");
      setIsInstructionsModalOpen(true);
    } else {
      navigate("/sendofferletter", { state: { jobId } });
    }
  };

  const handleOfferLetterTemplate = () => {
    if (!jobDescription?.joiningInstructions) {
      setPendingAction("template");
      setIsInstructionsModalOpen(true);
    } else {
      navigate("/offerlettertemplate", { state: { jobId } });
    }
  };

  const handleOpenInstructionsModal = () => {
    setIsInstructionsModalOpen(true);
  };

  const handleCloseInstructionsModal = () => {
    setIsInstructionsModalOpen(false);
    setPendingAction(null);
  };

  const handleInstructionsSuccess = () => {
    setIsInstructionsModalOpen(false);
    refetch();
    if (pendingAction === "sendOffer") {
      navigate("/sendofferletter", { state: { jobId } });
    } else if (pendingAction === "template") {
      navigate("/offerlettertemplate", { state: { jobId } });
    }
    setPendingAction(null);
  };

  return (
    <ViewDetials
      jobId={jobId}
      status={status}
      jobDescription={jobDescription}
      isLoading={isLoading}
      error={error}
      existingTemplate={existingTemplate}
      isHiringManagerForThisJob={isHiringManagerForThisJob}
      copied={copied}
      onCopyLink={handleCopyLink}
      getFullApplicationLink={getFullApplicationLink}
      formatMonthYear={formatMonthYear}
      onBack={handleBack}
      onViewApplicants={handleViewApplicants}
      onActivate={handleActivate}
      onSendOfferLetter={handleSendOfferLetter}
      onOfferLetterTemplate={handleOfferLetterTemplate}
      isInstructionsModalOpen={isInstructionsModalOpen}
      onOpenInstructionsModal={handleOpenInstructionsModal}
      onCloseInstructionsModal={handleCloseInstructionsModal}
      onInstructionsSuccess={handleInstructionsSuccess}
      {...props}
    />
  );
};

export default PositionDetailsPage;

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SelectTemplate from "../../component/offerletter/SelectTemplate";
import { useViewDetails } from "../../hooks/useViewDetails";

/**
 * SelectTemplatePage Controller
 * Step 1 of the Offer Letter workflow (/selecttemplate).
 * Manages:
 * - Data fetching for job position details (useViewDetails)
 * - Template design ('default', 'customize1', 'customize2') and theme color selection
 * - Template preview modal state (open, image, title)
 * - Candidate info formatting (initials, date, time)
 * - Navigation to candidate details configuration (Step 2: /offerletter) or back to applicants
 */
const SelectTemplatePage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const status = props.status !== undefined ? props.status : state.status;
  const jobId = props.jobId !== undefined ? props.jobId : state.jobId;
  const candidate = props.candidate !== undefined ? props.candidate : state.candidate;

  // Fetch job details for role, department, and company information
  const { jobDescription } = useViewDetails(jobId);

  // Template and Theme selection state
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [selectedColor, setSelectedColor] = useState("blue");

  // Template preview modal state
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    img: null,
    title: "",
  });

  useEffect(() => {
    document.title = candidate?.name
      ? `Select Offer Template for ${candidate.name} | Talent OS`
      : "Select Offer Template | Talent OS";

    if (!jobId) {
      navigate(-1);
    }
  }, [candidate?.name, jobId, navigate]);

  // Candidate name initials (e.g. "John Doe" -> "JD")
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Convert "HH:MM" to "hh:mm AM/PM"
  const formatTimeAMPM = (time) => {
    if (!time) return "";
    if (time.includes("AM") || time.includes("PM")) return time;
    const [hours, minutes] = time.split(":");
    let h = parseInt(hours, 10);
    const m = minutes || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, "0")}:${m} ${ampm}`;
  };

  // Format date and time for candidate summary card
  const formatInterviewDate = (date, time) => {
    if (!date) return "Not Scheduled";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Not Scheduled";
      const dateStr = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const formattedTime = formatTimeAMPM(time);
      return `${dateStr}${formattedTime ? `, ${formattedTime}` : ""}`;
    } catch {
      return "Not Scheduled";
    }
  };

  const handleOpenPreview = (img, title) => {
    setPreviewModal({
      isOpen: true,
      img,
      title,
    });
  };

  const handleClosePreview = () => {
    setPreviewModal({
      isOpen: false,
      img: null,
      title: "",
    });
  };

  const handleBack = () => {
    navigate("/viewApplicants", { state: { status, jobId, tab: "Hired" } });
  };

  const handleProceed = (overridePayload) => {
    const payload = overridePayload || {
      jobId,
      status,
      candidate,
      selectedTemplate,
      selectedColor,
    };
    navigate("/offerletter", { state: payload });
  };

  return (
    <SelectTemplate
      status={status}
      jobId={jobId}
      candidate={candidate}
      jobDescription={jobDescription}
      selectedTemplate={selectedTemplate}
      onSelectTemplate={setSelectedTemplate}
      selectedColor={selectedColor}
      onSelectColor={setSelectedColor}
      previewModal={previewModal}
      onOpenPreview={handleOpenPreview}
      onClosePreview={handleClosePreview}
      getInitials={getInitials}
      formatInterviewDate={formatInterviewDate}
      onBack={handleBack}
      onProceed={handleProceed}
      {...props}
    />
  );
};

export default SelectTemplatePage;

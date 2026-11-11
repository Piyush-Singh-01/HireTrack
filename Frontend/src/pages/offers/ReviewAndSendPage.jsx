import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Reviewandsend from "../../component/offerletter/Reviewandsend";
import { useSendOfferLetter } from "../../hooks/useOfferLetterTemplate";
import { useToast } from "../../utils/ToastContext";

/**
 * ReviewAndSendPage Controller
 * Step 3 of the Offer Letter workflow (/reviewandsend).
 * Manages:
 * - Route state validation (formData, jobId, candidate)
 * - Sending mutation execution (useSendOfferLetter)
 * - Pre-flight validations (required fields, company logo, signature)
 * - Success modal state management
 * - Step navigation back to configuration (/offerletter) or completion to candidate list (/viewApplicants)
 */
const ReviewAndSendPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const state = location.state || {};
  const formData = props.formData !== undefined ? props.formData : state.formData || {};
  const logo = props.logo !== undefined ? props.logo : state.logo;
  const jobId = props.jobId !== undefined ? props.jobId : state.jobId;
  const candidate = props.candidate !== undefined ? props.candidate : state.candidate;
  const status = props.status !== undefined ? props.status : state.status;

  const [showSuccess, setShowSuccess] = useState(false);
  const sendOfferMutation = useSendOfferLetter();

  useEffect(() => {
    document.title = candidate?.name
      ? `Review Offer for ${candidate.name} | Talent OS`
      : "Review & Send Offer Letter | Talent OS";

    if (!formData || !jobId) {
      navigate(-1);
    }
  }, [candidate?.name, formData, jobId, navigate]);

  const handleBack = () => {
    navigate("/offerletter", {
      state: { jobId, status, candidate, formData, logo },
    });
  };

  const handleComplete = () => {
    navigate("/viewApplicants", {
      state: { jobId, status, tab: "Hired" },
    });
  };

  const handleSendOffer = async () => {
    const requiredFields = [
      { key: "companyName", label: "Company Name" },
      { key: "companyAddress", label: "Company Address" },
      { key: "salutation", label: "Salutation" },
      { key: "candidateName", label: "Candidate Name" },
      { key: "introParagraph", label: "Intro Paragraph" },
      { key: "date", label: "Date" },
      { key: "position", label: "Position / Role" },
      { key: "duration", label: "Duration" },
      { key: "startDate", label: "Start Date" },
      { key: "location", label: "Location" },
      { key: "responsibilities", label: "Responsibilities" },
      { key: "notice", label: "Notice" },
      { key: "closingNote", label: "Closing Note" },
      { key: "website", label: "Website" },
    ];

    if (formData.employmentType === "Employee") {
      requiredFields.push({ key: "salary", label: "Salary" });
    } else {
      requiredFields.push({ key: "endDate", label: "End Date" });
      requiredFields.push({ key: "stipend", label: "Stipend" });
    }

    for (const field of requiredFields) {
      if (!formData[field.key]?.trim()) {
        showToast(`${field.label} is required`, "error");
        return;
      }
    }

    if (!logo) {
      showToast("Company Logo is required", "error");
      return;
    }

    if (!formData.signature) {
      showToast("Signature is required", "error");
      return;
    }

    const targetCandidateId = candidate?.id || candidate?._id || candidate?.applicationId;

    const finalFormData = { ...formData };
    if (finalFormData.noticePeriod && /^\d+$/.test(finalFormData.noticePeriod.trim())) {
      finalFormData.noticePeriod = `${finalFormData.noticePeriod.trim()} Working Days`;
    }

    try {
      await sendOfferMutation.mutateAsync({
        templateData: {
          ...finalFormData,
          logo,
        },
        candidateIds: targetCandidateId ? [targetCandidateId] : [],
        jobId,
      });
      setShowSuccess(true);
      showToast("Offer letter sent successfully", "success");
    } catch (error) {
      console.error("Failed to send offer letter:", error);
      showToast(error?.response?.data?.message || "Failed to send offer letter", "error");
    }
  };

  return (
    <Reviewandsend
      formData={formData}
      logo={logo}
      jobId={jobId}
      candidate={candidate}
      status={status}
      showSuccess={showSuccess}
      setShowSuccess={setShowSuccess}
      isSending={sendOfferMutation.isPending}
      onSend={handleSendOffer}
      onBack={handleBack}
      onComplete={handleComplete}
      {...props}
    />
  );
};

export default ReviewAndSendPage;

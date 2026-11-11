import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SendOfferLetter from "../../component/offerletter/SendOfferLetter";
import { useGetOfferLetterTemplate, useSendOfferLetter } from "../../hooks/useOfferLetterTemplate";
import { useViewDetails } from "../../hooks/useViewDetails";
import { useViewApplicants } from "../../hooks/useViewApplicants";
import { useGetProfile } from "../../hooks/settings/useGetProfile";
import { useToast } from "../../utils/ToastContext";

/**
 * SendOfferLetterPage Controller
 * Direct/Batch Offer Letter Dispatch (/sendofferletter).
 * Manages:
 * - Data fetching: useGetOfferLetterTemplate, useViewDetails, useViewApplicants, useGetProfile
 * - Multi-candidate selection state & candidate names concatenation
 * - Form state for offer letter details (company, role, dates, terms, compensation, notes)
 * - File upload state (logo, signature, agreement PDF)
 * - Pre-flight validations
 * - Sequential/Batch sending loop with progress tracking (isSending, sentCount, totalCount)
 * - Success modal state management
 * - Navigation delegates
 */
const SendOfferLetterPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const state = location.state || {};
  const initialCandidate = props.candidate !== undefined ? props.candidate : state.candidate;
  const jobId = props.jobId !== undefined ? props.jobId : state.jobId;

  // Data queries & mutations
  const { data: existingTemplate, isLoading: isTemplateLoading, isFetching } = useGetOfferLetterTemplate(jobId);
  const { data: jobDetails } = useViewDetails(jobId);
  const { data: applicantsData } = useViewApplicants();
  const { data: profileData } = useGetProfile();
  const sendOfferMutation = useSendOfferLetter();

  const hiredCandidates = applicantsData?.hired || [];

  const initialFormState = {
    companyName: "",
    companyAddress: "",
    salutation: "Dear",
    candidateName: "",
    introParagraph: "",
    date: new Date().toISOString().split("T")[0],
    position: "",
    duration: "6 months",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split("T")[0],
    noticePeriod: "5 Working Days",
    location: "Remote",
    stipend: "Unpaid Internship",
    responsibilities: "",
    notice: "",
    closingNote: "",
    signature: null,
    website: "",
    agreement: null,
    employmentType: "Internship",
    salary: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState(
    initialCandidate?.id ? [initialCandidate.id] : []
  );
  const [logo, setLogo] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    document.title = "Send Offer Letter | Talent OS";
    if (!jobId) {
      navigate(-1);
    }
  }, [jobId, navigate]);

  // Reset form when jobId changes
  useEffect(() => {
    setFormData(initialFormState);
    setLogo(null);
    setSelectedCandidateIds(initialCandidate?.id ? [initialCandidate.id] : []);
  }, [jobId]);

  // Sync with template, job details, and profile defaults
  useEffect(() => {
    if (isTemplateLoading) return;

    const role = jobDetails?.jobTitle || initialCandidate?.jobDetails?.jobTitle || initialCandidate?.position || "";
    const company = profileData?.companyName || "";
    const address = profileData?.companyAddress || "";

    const cleanResponsibilities = (jobDetails?.responsibilities || "")
      .replace(/^[•*-]\s*/gm, "")
      .replace(/\n[•*-]\s*/g, "\n");

    setFormData((prev) => ({
      ...prev,
      ...(existingTemplate || {}),
      position: existingTemplate?.position || role,
      companyName: existingTemplate?.companyName || company,
      companyAddress: existingTemplate?.companyAddress || address,
      candidateName: prev.candidateName || initialCandidate?.name || "",
      introParagraph:
        existingTemplate?.introParagraph ||
        (role && company
          ? `We are pleased to inform you that you have been selected for the ${role} Internship at ${company}. We were impressed with your creativity, design skills, and enthusiasm, and we believe you will be a valuable addition to our team.`
          : ""),
      responsibilities: existingTemplate?.responsibilities || cleanResponsibilities,
    }));

    if (existingTemplate?.logo) {
      setLogo(existingTemplate.logo);
    } else if (profileData?.companyLogo) {
      setLogo(profileData.companyLogo);
    }

    if (existingTemplate?.signature) {
      setFormData((prev) => ({ ...prev, signature: existingTemplate.signature }));
    }
  }, [existingTemplate, jobDetails, profileData, isTemplateLoading, isFetching, initialCandidate]);

  // Handle multi-selection updates for candidate names
  useEffect(() => {
    if (selectedCandidateIds.length > 0) {
      const selectedNames = hiredCandidates
        .filter((c) => selectedCandidateIds.includes(c.id))
        .map((c) => c.name);

      setFormData((prev) => ({
        ...prev,
        candidateName: selectedNames.join(", "),
      }));
    } else {
      setFormData((prev) => ({ ...prev, candidateName: "" }));
    }
  }, [selectedCandidateIds, hiredCandidates]);

  // Sync jobDetails if updated dynamically
  useEffect(() => {
    if (jobDetails) {
      setFormData((prev) => ({
        ...prev,
        position: jobDetails.jobTitle || prev.position,
        responsibilities: jobDetails.responsibilities || prev.responsibilities,
        introParagraph: jobDetails.about || prev.introParagraph,
      }));
    }
  }, [jobDetails]);

  const toggleCandidate = (id) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllCandidates = () => {
    if (selectedCandidateIds.length === hiredCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(hiredCandidates.map((c) => c.id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updates = { [name]: value };
      if (name === "employmentType") {
        if (value === "Employee") {
          updates.duration = prev.duration === "6 months" ? "Full-time" : prev.duration;
        } else {
          updates.duration = prev.duration === "Full-time" ? "6 months" : prev.duration;
        }
      }
      return { ...prev, ...updates };
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, signature: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSignature = () => {
    setFormData((prev) => ({ ...prev, signature: null }));
  };

  const handleAgreementChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, agreement: reader.result }));
      };
      reader.readAsDataURL(file);
    } else if (file) {
      showToast("Please upload a PDF file for agreement", "error");
    }
  };

  const handleRemoveAgreement = () => {
    setFormData((prev) => ({ ...prev, agreement: null }));
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

    if (selectedCandidateIds.length === 0) {
      showToast("Please select at least one candidate", "error");
      return;
    }

    if (!logo) {
      showToast("Company Logo is required", "error");
      return;
    }

    if (!formData.signature) {
      showToast("Signature is required", "error");
      return;
    }

    setIsSending(true);
    setSentCount(0);
    setTotalCount(selectedCandidateIds.length);
    let successCount = 0;

    try {
      const finalFormData = { ...formData };
      if (finalFormData.noticePeriod && /^\d+$/.test(finalFormData.noticePeriod.trim())) {
        finalFormData.noticePeriod = `${finalFormData.noticePeriod.trim()} Working Days`;
      }

      for (const candidateId of selectedCandidateIds) {
        try {
          const result = await sendOfferMutation.mutateAsync({
            jobId,
            candidateIds: [candidateId],
            templateData: { ...finalFormData, logo, signature: finalFormData.signature },
          });

          if (result.success) {
            successCount++;
          }
        } catch (err) {
          console.error("Failed for candidate:", candidateId, err);
        }
        setSentCount((prev) => prev + 1);
      }

      if (successCount > 0) {
        showToast(
          `Successfully sent ${successCount} out of ${selectedCandidateIds.length} offer letters!`,
          "success"
        );
        setShowSuccess(true);
      } else {
        showToast("Failed to send offer letters", "error");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to send offer letters";
      showToast(msg, "error");
    } finally {
      setIsSending(false);
      setSentCount(0);
    }
  };

  const handleNavigateDashboard = () => {
    navigate("/dashboard");
  };

  const handleNavigateTemplate = ({ jobId: targetJobId } = {}) => {
    navigate("/offerlettertemplate", { state: { jobId: targetJobId || jobId } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <SendOfferLetter
      candidate={initialCandidate}
      jobId={jobId}
      formData={formData}
      logo={logo}
      hiredCandidates={hiredCandidates}
      selectedCandidateIds={selectedCandidateIds}
      isSending={isSending}
      sentCount={sentCount}
      totalCount={totalCount}
      showSuccess={showSuccess}
      setShowSuccess={setShowSuccess}
      onToggleCandidate={toggleCandidate}
      onToggleAllCandidates={toggleAllCandidates}
      onChange={handleChange}
      onLogoChange={handleLogoChange}
      onRemoveLogo={handleRemoveLogo}
      onSignatureChange={handleSignatureChange}
      onRemoveSignature={handleRemoveSignature}
      onAgreementChange={handleAgreementChange}
      onRemoveAgreement={handleRemoveAgreement}
      onSendOffer={handleSendOffer}
      onNavigateDashboard={handleNavigateDashboard}
      onNavigateTemplate={handleNavigateTemplate}
      onBack={handleBack}
      {...props}
    />
  );
};

export default SendOfferLetterPage;

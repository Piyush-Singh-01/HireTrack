import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Offerletter from "../../component/offerletter/Offerletter";
import { useGetOfferLetterTemplate } from "../../hooks/useOfferLetterTemplate";
import { useViewDetails } from "../../hooks/useViewDetails";
import { useGetProfile } from "../../hooks/settings/useGetProfile";
import { useToast } from "../../utils/ToastContext";

/**
 * OfferLetterPage Controller
 * Step 2 of the Offer Letter workflow (/offerletter).
 * Manages:
 * - Data fetching for saved templates (useGetOfferLetterTemplate), position details (useViewDetails), profile (useGetProfile)
 * - Complete offer letter form state (company, candidate, dates, terms, compensation, notes)
 * - File upload state (company logo, signature, PDF agreement attachment)
 * - Default template & organization synchronization
 * - Field validations (required text, logo, signature)
 * - Joining instructions verification & modal trigger
 * - Step navigation to Review (Step 3: /reviewandsend) or back to Template Selection (Step 1: /selecttemplate)
 */
const OfferLetterPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const state = location.state || {};
  const jobId = props.jobId !== undefined ? props.jobId : state.jobId;
  const candidate = props.candidate !== undefined ? props.candidate : state.candidate;
  const status = props.status !== undefined ? props.status : state.status;
  const selectedTemplate = props.selectedTemplate !== undefined ? props.selectedTemplate : state.selectedTemplate;
  const selectedColor = props.selectedColor !== undefined ? props.selectedColor : state.selectedColor;

  // Data queries
  const { data: existingTemplate, isLoading: isTemplateLoading, isFetching } = useGetOfferLetterTemplate(jobId);
  const { data: jobDetails, refetch: refetchJobDetails } = useViewDetails(jobId);
  const { data: profileData } = useGetProfile();

  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);

  const initialFormState = {
    companyName: "",
    companyAddress: "",
    salutation: "Dear",
    candidateName: "",
    introParagraph: "",
    date: "",
    position: "",
    duration: "6 months",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split("T")[0],
    noticePeriod: "5 Working Days",
    location: "Remote",
    stipend: "Unpaid Internship",
    responsibilities: "",
    notice: "Please confirm your acceptance of this offer by signing and returning the attached copy of this letter by [Confirmation Date].",
    closingNote: "",
    selectedTemplate: selectedTemplate || "default",
    selectedColor: selectedColor || "blue",
    signature: null,
    website: "",
    agreement: null,
    employmentType: "Internship",
    salary: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    document.title = candidate?.name
      ? `Offer Letter for ${candidate.name} | Talent OS`
      : "Configure Offer Letter | Talent OS";

    if (!jobId) {
      navigate(-1);
    }
  }, [candidate?.name, jobId, navigate]);

  // Reset form when jobId changes
  useEffect(() => {
    setFormData(initialFormState);
    setLogo(null);
  }, [jobId]);

  // Sync form with template, job details, and organization profile
  useEffect(() => {
    if (isTemplateLoading) return;

    const role = jobDetails?.jobTitle || candidate?.jobDetails?.jobTitle || candidate?.position || "";
    const company = profileData?.organizationName || profileData?.userName || "TECH JOSE";
    const address = profileData?.companyAddress || "";

    // Clean bullet points from responsibilities
    let cleanResponsibilities = jobDetails?.responsibilities || "";
    cleanResponsibilities = cleanResponsibilities
      .split("\n")
      .map((line) => line.replace(/^[\s]*[•●\-\*·▪]\s*/, "").trim())
      .filter(Boolean)
      .join("\n");

    setFormData((prev) => ({
      ...prev,
      ...(existingTemplate || {}),
      companyName: existingTemplate?.companyName || prev.companyName || company,
      companyAddress: existingTemplate?.companyAddress || prev.companyAddress || address,
      position: existingTemplate?.position || prev.position || role,
      candidateName: prev.candidateName || candidate?.name || "",
      responsibilities: existingTemplate?.responsibilities || prev.responsibilities || cleanResponsibilities,
      introParagraph:
        existingTemplate?.introParagraph ||
        prev.introParagraph ||
        (role
          ? `We are pleased to inform you that you have been selected for the ${role} Internship at ${company}. We were impressed with your creativity, design skills, and enthusiasm, and we believe you will be a valuable addition to our team.`
          : ""),
      selectedTemplate: selectedTemplate || existingTemplate?.selectedTemplate || prev.selectedTemplate || "default",
      selectedColor: selectedColor || existingTemplate?.selectedColor || prev.selectedColor || "blue",
    }));

    if (existingTemplate?.logo) {
      setLogo(existingTemplate.logo);
    } else if (profileData?.companyLogo) {
      setLogo(profileData.companyLogo);
    }

    if (existingTemplate?.signature) {
      setFormData((prev) => ({ ...prev, signature: existingTemplate.signature }));
    }
  }, [existingTemplate, jobDetails, profileData, isTemplateLoading, isFetching, candidate]);

  // Input change handler
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

  // Logo file upload handler
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

  // Signature file upload handler
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

  // PDF Agreement file upload handler
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

  // Validation and step navigation to Review (Step 3)
  const handleProceedReview = () => {
    if (!jobDetails?.joiningInstructions) {
      setIsInstructionsModalOpen(true);
      return;
    }

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

    const finalFormData = { ...formData };
    if (finalFormData.noticePeriod && /^\d+$/.test(finalFormData.noticePeriod.trim())) {
      finalFormData.noticePeriod = `${finalFormData.noticePeriod.trim()} Working Days`;
    }

    navigate("/reviewandsend", {
      state: { jobId, status, candidate, formData: finalFormData, logo },
    });
  };

  // Back navigation to Select Template (Step 1)
  const handleBackToTemplate = () => {
    navigate("/selecttemplate", {
      state: { jobId, status, candidate, selectedTemplate, selectedColor },
    });
  };

  return (
    <Offerletter
      jobId={jobId}
      candidate={candidate}
      status={status}
      selectedTemplate={selectedTemplate}
      selectedColor={selectedColor}
      formData={formData}
      logo={logo}
      isTemplateLoading={isTemplateLoading}
      jobDetails={jobDetails}
      isInstructionsModalOpen={isInstructionsModalOpen}
      setIsInstructionsModalOpen={setIsInstructionsModalOpen}
      refetchJobDetails={refetchJobDetails}
      onChange={handleChange}
      onLogoChange={handleLogoChange}
      onRemoveLogo={handleRemoveLogo}
      onSignatureChange={handleSignatureChange}
      onRemoveSignature={handleRemoveSignature}
      onAgreementChange={handleAgreementChange}
      onRemoveAgreement={handleRemoveAgreement}
      onProceedReview={handleProceedReview}
      onBackToTemplate={handleBackToTemplate}
      {...props}
    />
  );
};

export default OfferLetterPage;

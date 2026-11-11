import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OfferLetterTemplate from "../../component/offerletter/OfferLetterTemplate";
import { useGetOfferLetterTemplate, useSaveOfferLetterTemplate } from "../../hooks/useOfferLetterTemplate";
import { useGetProfile } from "../../hooks/settings/useGetProfile";
import { useViewDetails } from "../../hooks/useViewDetails";
import { useToast } from "../../utils/ToastContext";

/**
 * OfferLetterTemplatePage Controller
 * Manages job position default offer letter template configuration (/offerlettertemplate).
 * Manages:
 * - Data fetching for saved templates, profile info, and position details
 * - Form state for template inputs (company, salutation, terms, compensation, notes, color theme)
 * - File state for template logo, signature, and agreement PDF
 * - Saving template mutation (useSaveOfferLetterTemplate) with toast notifications
 * - Joining instructions verification & modal trigger
 * - Return navigation
 */
const OfferLetterTemplatePage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const state = location.state || {};
  const jobId = props.jobId !== undefined ? props.jobId : state.jobId;

  // Data queries & mutations
  const { data: profileData } = useGetProfile();
  const { data: jobDetails, refetch: refetchJobDetails } = useViewDetails(jobId);
  const { data: existingTemplate, isLoading: isTemplateLoading, isFetching } = useGetOfferLetterTemplate(jobId);
  const saveTemplateMutation = useSaveOfferLetterTemplate(jobId);

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
    startDate: "",
    endDate: "",
    noticePeriod: "5 Working Days",
    location: "Remote",
    stipend: "Unpaid Internship",
    responsibilities: "",
    notice: "Please confirm your acceptance of this offer by signing and returning the attached copy of this letter by [Confirmation Date].",
    closingNote: "",
    signature: null,
    website: "",
    agreement: null,
    selectedColor: "blue",
    employmentType: "Internship",
    salary: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    document.title = "Offer Letter Template Editor | Talent OS";
    if (!jobId) {
      navigate(-1);
    }
  }, [jobId, navigate]);

  // Reset form when jobId changes
  useEffect(() => {
    setFormData(initialFormState);
    setLogo(null);
  }, [jobId]);

  // Sync with template, job details, and profile defaults
  useEffect(() => {
    if (isTemplateLoading) return;

    const role = jobDetails?.jobTitle || "";
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
      introParagraph:
        existingTemplate?.introParagraph ||
        (role && company
          ? `We are pleased to inform you that you have been selected for the ${role} Internship at ${company}. We were impressed with your creativity, design skills, and enthusiasm, and we believe you will be a valuable addition to our team.`
          : ""),
      responsibilities: existingTemplate?.responsibilities || cleanResponsibilities,
      selectedColor: existingTemplate?.selectedColor || prev.selectedColor || "blue",
    }));

    if (existingTemplate?.logo) {
      setLogo(existingTemplate.logo);
    } else if (profileData?.companyLogo) {
      setLogo(profileData.companyLogo);
    }

    if (existingTemplate?.signature) {
      setFormData((prev) => ({ ...prev, signature: existingTemplate.signature }));
    }
  }, [existingTemplate, jobDetails, profileData, isTemplateLoading, isFetching]);

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

  const handleColorSelect = (colorId) => {
    setFormData((prev) => ({ ...prev, selectedColor: colorId }));
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

  const handleSaveTemplate = async () => {
    if (!jobDetails?.joiningInstructions) {
      setIsInstructionsModalOpen(true);
      return;
    }

    try {
      await saveTemplateMutation.mutateAsync({
        ...formData,
        jobId,
        logo,
      });
      showToast("Template saved successfully", "success");
      navigate(-1);
    } catch (error) {
      console.error("Failed to save template:", error);
      showToast(error?.response?.data?.message || "Failed to save template", "error");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <OfferLetterTemplate
      jobId={jobId}
      formData={formData}
      logo={logo}
      isTemplateLoading={isTemplateLoading}
      jobDetails={jobDetails}
      isSaving={saveTemplateMutation.isPending}
      isInstructionsModalOpen={isInstructionsModalOpen}
      setIsInstructionsModalOpen={setIsInstructionsModalOpen}
      refetchJobDetails={refetchJobDetails}
      onChange={handleChange}
      onColorSelect={handleColorSelect}
      onLogoChange={handleLogoChange}
      onRemoveLogo={handleRemoveLogo}
      onSignatureChange={handleSignatureChange}
      onRemoveSignature={handleRemoveSignature}
      onAgreementChange={handleAgreementChange}
      onRemoveAgreement={handleRemoveAgreement}
      onSaveTemplate={handleSaveTemplate}
      onBack={handleBack}
      {...props}
    />
  );
};

export default OfferLetterTemplatePage;

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CreateApplicationPage2Component from "../../component/jobPost/Application/CreateApplicationPage2";
import { useApplicationModules } from "../../utils/AppModulesContext";

/**
 * CreateApplicationPage2
 * Page Controller for Step 2 of Application Form Builder (Experience, Skills, Attachments).
 * Manages:
 * - Application modules context sync (formData, selectedModules)
 * - State for dynamic experience entries (add, remove, edit)
 * - State for skill chips (add, remove)
 * - State for attachments (add, remove)
 * - State for custom questions editing and deletion modal
 * - Navigation to add inputs (/screeningPerModule), back navigation, and next step progression
 */
const CreateApplicationPage2 = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { formData, setFormData, selectedModules } = useApplicationModules();
  const jobDetails = props.jobDetails || location.state?.jobDetails || {};

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    module: null,
    id: null,
  });

  useEffect(() => {
    document.title = "Application Form Builder - Step 2 | Talent OS";
  }, []);

  // Add skill to formData.skills array
  const handleAddSkill = (skillText) => {
    const skill = (skillText || "").trim();
    if (skill && !(formData.skills || []).includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skill],
      }));
    }
  };

  // Remove skill by name
  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skillToRemove),
    }));
  };

  // Add new blank experience entry
  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...(prev.experience ?? []),
        {
          companyName: "",
          role: "",
          startDate: "",
          endDate: "",
          responsibility: "",
          currentCTC: "",
          expectedCTC: "",
          noticePeriod: "",
        },
      ],
    }));
  };

  // Remove experience entry by index
  const handleRemoveExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index),
    }));
  };

  // Update specific field inside an experience entry
  const handleExperienceChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.experience || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  // Add uploaded attachment files
  const handleAddAttachment = (files) => {
    const newAttachments = Array.from(files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments],
    }));
  };

  // Remove attachment by index
  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index),
    }));
  };

  // Module configuration updates (e.g. allowMultipleEntries)
  const handleModuleConfigChange = (module, value) => {
    setFormData((prev) => ({
      ...prev,
      moduleConfig: {
        ...prev.moduleConfig,
        [module]: {
          ...prev.moduleConfig?.[module],
          allowMultipleEntries: value,
        },
      },
    }));
  };

  // Update a custom screening question
  const handleQuestionChange = (module, questionId, updates) => {
    setFormData((prev) => {
      const moduleQuestions = prev.screeningQuestions?.[module] || [];
      const updatedQuestions = moduleQuestions.map((q) =>
        q.fieldId === questionId || q.id === questionId
          ? { ...q, ...updates }
          : q
      );
      return {
        ...prev,
        screeningQuestions: {
          ...prev.screeningQuestions,
          [module]: updatedQuestions,
        },
      };
    });
  };

  // Open modal to confirm question deletion
  const handleDeleteQuestion = (module, questionId) => {
    setDeleteModal({ show: true, module, id: questionId });
  };

  // Confirm and execute question deletion
  const handleConfirmDelete = () => {
    const { module, id } = deleteModal;
    setFormData((prev) => {
      const moduleQuestions = prev.screeningQuestions?.[module] || [];
      const updatedQuestions = moduleQuestions.filter(
        (q) => q.fieldId !== id && q.id !== id
      );
      return {
        ...prev,
        screeningQuestions: {
          ...prev.screeningQuestions,
          [module]: updatedQuestions,
        },
      };
    });
    setDeleteModal({ show: false, module: null, id: null });
  };

  // Close delete modal without deleting
  const handleCloseDeleteModal = () => {
    setDeleteModal({ show: false, module: null, id: null });
  };

  // Navigate to add new custom inputs for a module
  const handleNavigateAddInput = (module) => {
    navigate("/screeningPerModule", {
      state: {
        jobDetails,
        module,
        returnTo: "step2",
      },
    });
  };

  // Step advancement handler
  const handleNextStep = () => {
    if (typeof props.nextStep === "function") {
      props.nextStep();
    } else if (selectedModules.screening) {
      navigate("/screening", { state: { jobDetails } });
    } else {
      navigate("/mainApp", { state: { jobDetails, step: 4 } });
    }
  };

  // Step backward handler
  const handlePrevStep = () => {
    if (typeof props.prevStep === "function") {
      props.prevStep();
    } else {
      navigate(-1);
    }
  };

  const experienceQuestions = formData?.screeningQuestions?.experience || [];
  const skillsQuestions = formData?.screeningQuestions?.skills || [];
  const attachmentQuestions = formData?.screeningQuestions?.attachments || [];
  const addInfoQuestions = formData?.screeningQuestions?.addInfo || [];

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <CreateApplicationPage2Component
          jobDetails={jobDetails}
          formData={formData}
          selectedModules={selectedModules}
          experienceQuestions={experienceQuestions}
          skillsQuestions={skillsQuestions}
          attachmentQuestions={attachmentQuestions}
          addInfoQuestions={addInfoQuestions}
          editingQuestionId={editingQuestionId}
          setEditingQuestionId={setEditingQuestionId}
          deleteModal={deleteModal}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
          onAddExperience={handleAddExperience}
          onRemoveExperience={handleRemoveExperience}
          onExperienceChange={handleExperienceChange}
          onAddAttachment={handleAddAttachment}
          onRemoveAttachment={handleRemoveAttachment}
          onModuleConfigChange={handleModuleConfigChange}
          onQuestionChange={handleQuestionChange}
          onDeleteQuestion={handleDeleteQuestion}
          onConfirmDelete={handleConfirmDelete}
          onCloseDeleteModal={handleCloseDeleteModal}
          onNavigateAddInput={handleNavigateAddInput}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
        />
      </div>
    </main>
  );
};

export default CreateApplicationPage2;

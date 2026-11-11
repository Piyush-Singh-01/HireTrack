import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CreateApplication from "../../component/jobPost/Application/CreateApplication";
import { useApplicationModules } from "../../utils/AppModulesContext";
import { useApplication } from "../../hooks/useApplication";

/**
 * CreateApplicationPage
 * Page Controller for Step 1 of Application Form Builder (Personal Information & Education).
 * Manages:
 * - Data fetching via useApplication
 * - Application modules context sync (formData, selectedModules)
 * - State for dynamic education entries (add, remove, edit)
 * - State for custom questions editing and deletion modal
 * - Navigation to add inputs (/screeningPerModule) and step progression
 */
const CreateApplicationPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { formData, setFormData, selectedModules } = useApplicationModules();
  const { isLoading } = useApplication();

  const jobDetails = props.jobDetails || location.state?.jobDetails || {};

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    module: null,
    id: null,
  });

  useEffect(() => {
    document.title = "Application Form Builder - Step 1 | Talent OS";
  }, []);

  // Update top-level personal info fields in formData
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add new blank education entry
  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...(prev.education ?? []),
        {
          institution: "",
          degreeLevel: "",
          program: "",
          startDate: "",
          endDate: "",
          yearOfGraduation: "",
          gpaOrPercent: "",
          pursuing: false,
        },
      ],
    }));
  };

  // Remove education entry by index
  const handleRemoveEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index),
    }));
  };

  // Update specific field inside an education entry
  const handleEducationChange = (index, field, value) => {
    const updated = [...(formData.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, education: updated }));
  };

  // Toggle currently pursuing for an education entry
  const handlePursuingChange = (index, isPursuing) => {
    const updated = [...(formData.education || [])];
    updated[index] = {
      ...updated[index],
      pursuing: isPursuing,
      yearOfGraduation: isPursuing ? "" : updated[index].yearOfGraduation,
    };
    setFormData((prev) => ({ ...prev, education: updated }));
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
        returnTo: "step1",
      },
    });
  };

  // Step advancement handler (either via props in wizard or route navigation)
  const handleNextStep = () => {
    if (typeof props.nextStep === "function") {
      props.nextStep();
    } else {
      navigate("/applicationLinkPage2", { state: { jobDetails } });
    }
  };

  const personalQuestions = formData?.screeningQuestions?.personalInfo || [];
  const educationQuestions = formData?.screeningQuestions?.education || [];

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <CreateApplication
          jobDetails={jobDetails}
          formData={formData}
          selectedModules={selectedModules}
          isLoading={isLoading}
          personalQuestions={personalQuestions}
          educationQuestions={educationQuestions}
          editingQuestionId={editingQuestionId}
          setEditingQuestionId={setEditingQuestionId}
          deleteModal={deleteModal}
          onPersonalChange={handlePersonalChange}
          onAddEducation={handleAddEducation}
          onRemoveEducation={handleRemoveEducation}
          onEducationChange={handleEducationChange}
          onPursuingChange={handlePursuingChange}
          onModuleConfigChange={handleModuleConfigChange}
          onQuestionChange={handleQuestionChange}
          onDeleteQuestion={handleDeleteQuestion}
          onConfirmDelete={handleConfirmDelete}
          onCloseDeleteModal={handleCloseDeleteModal}
          onNavigateAddInput={handleNavigateAddInput}
          onNextStep={handleNextStep}
        />
      </div>
    </main>
  );
};

export default CreateApplicationPage;

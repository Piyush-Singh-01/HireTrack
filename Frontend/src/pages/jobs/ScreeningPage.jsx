import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Screening from "../../component/jobPost/Application/Screening";
import { useApplicationModules } from "../../utils/AppModulesContext";
import { useToast } from "../../utils/ToastContext";

const createId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const makeInitialOptions = () => [
  { id: createId(), text: "", isCorrect: false },
  { id: createId(), text: "", isCorrect: false },
];

const DEFAULT_FILE_CONFIG = {
  multiple: false,
  maxFileSize: 5 * 1024 * 1024,
  allowedFileTypes: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
};

/**
 * ScreeningPage
 * Page Controller for Step 3 of Application Form Builder (Screening Questions).
 * Manages:
 * - Application modules context sync (formData)
 * - State for creating new screening questions (short, paragraph, choice, multiple choice)
 * - State for question options and correct answer configuration
 * - State for custom questions editing and deletion modal
 * - Navigation to final review step or previous step
 */
const ScreeningPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const { formData, setFormData } = useApplicationModules();
  const jobDetails = props.jobDetails || location.state?.jobDetails || {};

  const [dropState, setDropState] = useState({
    short: true,
    paragraph: false,
    choice: false,
    multipleChoice: false,
  });

  const [questionText, setQuestionText] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [allowFileUpload, setAllowFileUpload] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [options, setOptions] = useState(makeInitialOptions);
  const [openDropdown, setOpenDropdown] = useState(false);

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    module: null,
    id: null,
  });

  useEffect(() => {
    document.title = "Screening Questions Setup | Talent OS";
  }, []);

  const MODULE_KEY = "screening";
  const screeningQuestions = formData?.screeningQuestions?.[MODULE_KEY] || [];

  const handleTypeChange = (value) => {
    setDropState({
      short: value === "short",
      paragraph: value === "paragraph",
      choice: value === "choice",
      multipleChoice: value === "multipleChoice",
    });
    setCorrectAnswer("");
    setOptions(makeInitialOptions());
  };

  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: createId(), text: "", isCorrect: false },
    ]);
  };

  const handleOptionTextChange = (id, text) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text } : opt))
    );
  };

  const handleOptionRadioCorrect = (id) => {
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        isCorrect: opt.id === id,
      }))
    );
  };

  const handleOptionCheckboxCorrect = (id) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt
      )
    );
  };

  const handleRemoveOption = (index) => {
    setOptions((prev) => {
      const removed = prev[index];
      const next = prev.filter((_, i) => i !== index);
      if (removed?.isCorrect) {
        setCorrectAnswer("");
      }
      return next;
    });
  };

  const resolveFieldType = () => {
    if (dropState.short) return "short";
    if (dropState.paragraph) return "paragraph";
    if (dropState.choice) return "choice";
    if (dropState.multipleChoice) return "multipleChoice";
    return "short";
  };

  const buildCorrectAnswer = () => {
    if (dropState.choice) {
      const picked = options.find((o) => o.isCorrect && o.text.trim());
      return picked ? picked.text.trim() : null;
    }
    if (dropState.multipleChoice) {
      const picked = options
        .filter((o) => o.isCorrect)
        .map((o) => o.text.trim())
        .filter(Boolean);
      return picked.length > 0 ? picked : null;
    }
    if (dropState.short) {
      return correctAnswer.trim() || null;
    }
    return null;
  };

  const handleSaveScreening = () => {
    const label = questionText.trim();
    if (!label) {
      showToast("Enter the question text before saving.", "error");
      return;
    }

    const isChoice = dropState.choice || dropState.multipleChoice;
    const cleanedOptions = isChoice
      ? options.map((o) => o.text.trim()).filter(Boolean)
      : [];

    if (isChoice) {
      if (cleanedOptions.length < 2) {
        showToast("Add at least two options for a choice question.", "error");
        return;
      }
      const unique = new Set(cleanedOptions.map((t) => t.toLowerCase()));
      if (unique.size !== cleanedOptions.length) {
        showToast("Options must be different from each other.", "error");
        return;
      }
    }

    const newId = createId();
    const finalCorrectAnswer = buildCorrectAnswer();

    setFormData((prev) => {
      const prevQuestions = prev.screeningQuestions?.[MODULE_KEY] || [];
      return {
        ...prev,
        screeningQuestions: {
          ...prev.screeningQuestions,
          [MODULE_KEY]: [
            ...prevQuestions,
            {
              id: newId,
              fieldId: newId,
              label,
              type: resolveFieldType(),
              options: cleanedOptions,
              required: enabled,
              placeholder: label,
              allowFileUpload,
              ...(allowFileUpload
                ? {
                    fileConfig: {
                      ...DEFAULT_FILE_CONFIG,
                      allowedFileTypes: [
                        ...DEFAULT_FILE_CONFIG.allowedFileTypes,
                      ],
                    },
                  }
                : {}),
              correctAnswer: finalCorrectAnswer,
              meta: {
                module: MODULE_KEY,
                isScreening: true,
              },
            },
          ],
        },
      };
    });

    setQuestionText("");
    setEnabled(false);
    setOptions(makeInitialOptions());
    setDropState({
      short: true,
      paragraph: false,
      choice: false,
      multipleChoice: false,
    });
    setAllowFileUpload(false);
    setCorrectAnswer("");

    showToast("Screening question added successfully.", "success");
  };

  const handleQuestionChange = (questionId, updates) => {
    setFormData((prev) => {
      const moduleQuestions = prev.screeningQuestions?.[MODULE_KEY] || [];
      const updatedQuestions = moduleQuestions.map((q) =>
        q.fieldId === questionId || q.id === questionId
          ? { ...q, ...updates }
          : q
      );
      return {
        ...prev,
        screeningQuestions: {
          ...prev.screeningQuestions,
          [MODULE_KEY]: updatedQuestions,
        },
      };
    });
  };

  const handleDeleteQuestion = (questionId) => {
    setDeleteModal({ show: true, module: MODULE_KEY, id: questionId });
  };

  const handleConfirmDelete = () => {
    const { id } = deleteModal;
    setFormData((prev) => {
      const moduleQuestions = prev.screeningQuestions?.[MODULE_KEY] || [];
      const updatedQuestions = moduleQuestions.filter(
        (q) => q.fieldId !== id && q.id !== id
      );
      return {
        ...prev,
        screeningQuestions: {
          ...prev.screeningQuestions,
          [MODULE_KEY]: updatedQuestions,
        },
      };
    });
    setDeleteModal({ show: false, module: null, id: null });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ show: false, module: null, id: null });
  };

  const handleNextStep = () => {
    if (typeof props.nextStep === "function") {
      props.nextStep();
    } else {
      navigate("/mainApp", { state: { jobDetails, step: 4 } });
    }
  };

  const handlePrevStep = () => {
    if (typeof props.prevStep === "function") {
      props.prevStep();
    } else {
      navigate(-1);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Screening
          jobDetails={jobDetails}
          screeningQuestions={screeningQuestions}
          dropState={dropState}
          questionText={questionText}
          setQuestionText={setQuestionText}
          enabled={enabled}
          setEnabled={setEnabled}
          allowFileUpload={allowFileUpload}
          setAllowFileUpload={setAllowFileUpload}
          correctAnswer={correctAnswer}
          setCorrectAnswer={setCorrectAnswer}
          options={options}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          editingQuestionId={editingQuestionId}
          setEditingQuestionId={setEditingQuestionId}
          deleteModal={deleteModal}
          onTypeChange={handleTypeChange}
          onAddOption={handleAddOption}
          onOptionTextChange={handleOptionTextChange}
          onOptionRadioCorrect={handleOptionRadioCorrect}
          onOptionCheckboxCorrect={handleOptionCheckboxCorrect}
          onRemoveOption={handleRemoveOption}
          onSaveScreening={handleSaveScreening}
          onQuestionChange={handleQuestionChange}
          onDeleteQuestion={handleDeleteQuestion}
          onConfirmDelete={handleConfirmDelete}
          onCloseDeleteModal={handleCloseDeleteModal}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
        />
      </div>
    </main>
  );
};

export default ScreeningPage;

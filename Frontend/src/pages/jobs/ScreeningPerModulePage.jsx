import React, { useState, useEffect } from "react";
import { ChevronDown, FileUser, Plus } from "lucide-react";
import { HiOutlinePhotograph } from "react-icons/hi";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { MdLocationOn } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useApplicationModules } from "../../utils/AppModulesContext";
import { useToast } from "../../utils/ToastContext";
import ConfirmationModal from "../../component/jobPost/Application/ui/ConfirmationModal";

const controlClass =
  "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 " +
  "placeholder:text-gray-400 shadow-sm transition-colors " +
  "focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

const optionInputClass =
  "min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 " +
  "placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

const Toggle = ({ label, checked, onClick }) => (
  <div className="flex items-center gap-2.5">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
        checked ? "bg-indigo-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const RemoveOptionButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="shrink-0 cursor-pointer rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
    title="Remove option"
    aria-label="Remove option"
  >
    <RiDeleteBin6Line className="h-4 w-4" />
  </button>
);

const OptionMarker = ({ round }) => (
  <span
    aria-hidden="true"
    className={`h-4 w-4 shrink-0 border-2 border-gray-300 ${round ? "rounded-full" : "rounded"}`}
  />
);

const createId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const DEFAULT_FILE_CONFIG = {
  multiple: false,
  maxFileSize: 5 * 1024 * 1024,
  allowedFileTypes: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
};

const makeInitialOptions = () => [
  { id: createId(), text: "", isCorrect: false },
  { id: createId(), text: "", isCorrect: false },
];

/**
 * ScreeningPerModulePage
 * Page for adding custom screening questions/inputs to specific application modules (/screeningPerModule).
 */
const ScreeningPerModulePage = () => {
  const [dropState, setDropState] = useState({
    short: true,
    paragraph: false,
    choice: false,
    multipleChoice: false,
    textOnly: false,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { jobDetails, module, returnTo } = location.state ?? {};
  const { showToast } = useToast();

  const [allowFileUpload, setAllowFileUpload] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [pendingModule, setPendingModule] = useState(null);

  const [correctAnswer, setCorrectAnswer] = useState("");
  const { formData, setFormData } = useApplicationModules();
  const [options, setOptions] = useState(makeInitialOptions);

  useEffect(() => {
    document.title = "Module Screening Questions | Talent OS";
  }, []);

  const screeningQuestions =
    formData?.screeningQuestions &&
    typeof formData.screeningQuestions === "object" &&
    !Array.isArray(formData.screeningQuestions)
      ? formData.screeningQuestions
      : {};

  const isScreening = true;
  const isChoiceType = dropState.choice || dropState.multipleChoice;

  const resolveFieldType = () => {
    if (dropState.short) return "short";
    if (dropState.paragraph) return "paragraph";
    if (dropState.choice) return "choice";
    if (dropState.multipleChoice) return "multipleChoice";
    if (dropState.textOnly) return "textOnly";
  };

  const selectedType = resolveFieldType() || "short";

  const handleTypeChange = (value) => {
    setDropState({
      short: value === "short",
      paragraph: value === "paragraph",
      choice: value === "choice",
      multipleChoice: value === "multipleChoice",
      textOnly: value === "textOnly",
    });
    setCorrectAnswer("");
    setOptions((prev) => prev.map((o) => ({ ...o, isCorrect: false })));
  };

  const buildCorrectAnswer = () => {
    if (!isScreening) return null;
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

  const moduleLabel =
    typeof module === "string"
      ? module.replace(/([A-Z])/g, " $1").toLowerCase()
      : "";
  const currentQuestions = screeningQuestions[module];
  const currentCount = Array.isArray(currentQuestions) ? currentQuestions.length : 0;

  const handleSaveScreeningInput = () => {
    const label = questionText.trim();
    if (!label) {
      showToast("Enter the question text before saving.", "error");
      return;
    }

    const cleanedOptions = isChoiceType
      ? options.map((o) => o.text.trim()).filter(Boolean)
      : [];

    if (isChoiceType) {
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
      const previousFormData = prev || {};
      const previousScreeningQuestions =
        previousFormData.screeningQuestions &&
        typeof previousFormData.screeningQuestions === "object" &&
        !Array.isArray(previousFormData.screeningQuestions)
          ? previousFormData.screeningQuestions
          : {};
      const existingModuleQuestions = Array.isArray(previousScreeningQuestions[module])
        ? previousScreeningQuestions[module]
        : [];

      return {
        ...previousFormData,
        screeningQuestions: {
          ...previousScreeningQuestions,
          [module]: [
            ...existingModuleQuestions,
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
                      allowedFileTypes: [...DEFAULT_FILE_CONFIG.allowedFileTypes],
                    },
                  }
                : {}),
              correctAnswer: finalCorrectAnswer,
              meta: {
                module,
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
      textOnly: false,
    });
    setAllowFileUpload(false);
    setCorrectAnswer("");

    showToast(`Input added to ${moduleLabel}.`, "success");
  };

  const handleBack = () => {
    if (returnTo === "step2") {
      navigate("/mainApp", {
        state: {
          jobDetails,
          step: 2,
        },
      });
    } else {
      navigate("/mainApp", {
        state: {
          jobDetails,
          step: 1,
        },
      });
    }
  };

  const hasUnsaved =
    questionText.trim() !== "" ||
    correctAnswer.trim() !== "" ||
    enabled ||
    allowFileUpload ||
    selectedType !== "short" ||
    options.some((option) => option.text.trim() !== "" || option.isCorrect) ||
    options.length !== 2;

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { id: createId(), text: "", isCorrect: false }]);
  };

  const resetInputDraft = () => {
    setQuestionText("");
    setEnabled(false);
    setOptions(makeInitialOptions());
    setDropState({
      short: true,
      paragraph: false,
      choice: false,
      multipleChoice: false,
      textOnly: false,
    });
    setAllowFileUpload(false);
    setCorrectAnswer("");
  };

  const handleModuleChange = (nextModule) => {
    if (nextModule === module) return;

    if (hasUnsaved) {
      setPendingModule(nextModule);
      setShowDiscard(true);
      return;
    }

    navigate(location.pathname, {
      replace: true,
      state: {
        ...location.state,
        module: nextModule,
      },
    });
  };

  const handleConfirmDiscard = () => {
    setShowDiscard(false);

    if (pendingModule) {
      const nextModule = pendingModule;
      setPendingModule(null);
      resetInputDraft();
      navigate(location.pathname, {
        replace: true,
        state: {
          ...location.state,
          module: nextModule,
        },
      });
      return;
    }

    handleBack();
  };

  if (typeof module !== "string" || !module.trim()) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <FileUser className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-bold text-gray-900">Nothing to add inputs to</h2>
        <p className="mt-1 text-sm text-gray-500">
          Open this page from the application form using the Add Input button.
        </p>
        <button
          type="button"
          onClick={() => navigate("/jobapplication")}
          className="mt-6 cursor-pointer rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          Go to application form
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl px-4 py-6 sm:px-6 mx-auto">
      {/* Page heading */}
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <FileUser className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-gray-900 md:text-xl">Application</h2>
          <p className="text-sm text-gray-500">Add custom inputs to the application form.</p>
        </div>
      </div>

      {/* Job summary */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 bg-indigo-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-medium text-indigo-600">Job details</p>
            <h2 className="text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
              {jobDetails?.jobTitle}
            </h2>
          </div>
          {jobDetails?.jobLocation && (
            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
              <MdLocationOn className="shrink-0 text-base text-gray-500" />
              {jobDetails.jobLocation}
            </span>
          )}
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_2fr] sm:gap-8 sm:p-7">
          <div>
            <p className="text-xs font-medium text-gray-500">Experience required</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {jobDetails?.experience || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Job description</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-600">
              {jobDetails?.about || jobDetails?.description || "No description provided."}
            </p>
          </div>
        </div>
      </section>

      {/* Module tabs */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <span className="text-sm font-medium text-gray-700">Add inputs to</span>
        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 text-sm font-medium">
          {Object.entries(screeningQuestions)
            .filter(([moduleKey]) => moduleKey !== "screening")
            .map(([moduleKey, questions]) => {
              const isActive = moduleKey === module;

              return (
                <button
                  key={moduleKey}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleModuleChange(moduleKey)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
                    isActive
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  }`}
                >
                  <span className="capitalize">
                    {moduleKey.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span
                    className={`rounded-full px-1.5 text-xs font-semibold ${
                      isActive ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {Array.isArray(questions) ? questions.length : 0}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-l-4 border-gray-200 border-l-indigo-600 bg-white p-4 shadow-sm sm:p-6">
        {/* First Row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className={`${controlClass} md:flex-1 md:text-base`}
            placeholder="e.g. Father's name"
          />

          <div className="flex items-center gap-3">
            {allowFileUpload && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                <HiOutlinePhotograph className="h-4 w-4" />
                File upload
              </span>
            )}

            <div className="relative w-full md:w-56">
              <HiMiniBars3BottomLeft className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <select
                onFocus={() => setOpenDropdown(true)}
                onBlur={() => setOpenDropdown(false)}
                name="answerType"
                aria-label="Answer type"
                value={selectedType}
                className={`${controlClass} cursor-pointer appearance-none pl-9 pr-9`}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="short">Short Answer</option>
                <option value="paragraph">Paragraph</option>
                <option value="choice">Single Choice</option>
                <option value="multipleChoice">Multiple Choice</option>
                <option value="textOnly">Question Only</option>
              </select>
              <ChevronDown
                className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-transform ${
                  openDropdown ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Answer preview / options */}
        <div className="mt-5 flex max-w-xl flex-col gap-4">
          {dropState.short && (
            <input
              type="text"
              className={controlClass}
              placeholder="Short Answer"
            />
          )}

          {dropState.paragraph && (
            <textarea
              className={`${controlClass} resize-y`}
              placeholder="Paragraph Answer"
              rows={4}
            />
          )}

          {dropState.choice && (
            <div>
              {isScreening && (
                <p className="mb-2 text-xs text-gray-500">
                  Use the radio button to mark the correct answer.
                </p>
              )}
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    {isScreening ? (
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={opt.isCorrect}
                        onChange={() => {
                          const updatedOptions = options.map((o) => ({
                            ...o,
                            isCorrect: o.id === opt.id,
                          }));
                          setOptions(updatedOptions);
                        }}
                        className="h-4 w-4 shrink-0 cursor-pointer border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    ) : (
                      <OptionMarker round />
                    )}

                    <input
                      type="text"
                      value={opt.text}
                      placeholder={`Option ${i + 1}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        const updatedOptions = options.map((o) =>
                          o.id === opt.id ? { ...o, text: value } : o
                        );
                        setOptions(updatedOptions);
                      }}
                      className={optionInputClass}
                    />
                    <RemoveOptionButton
                      onClick={() => {
                        const newOptions = options.filter((_, idx) => idx !== i);
                        setOptions(newOptions);
                        if (opt.isCorrect) setCorrectAnswer("");
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {dropState.multipleChoice && (
            <div>
              {isScreening && (
                <p className="mb-2 text-xs text-gray-500">
                  Tick the checkboxes to mark the correct answers.
                </p>
              )}
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    {isScreening ? (
                      <input
                        type="checkbox"
                        checked={opt.isCorrect}
                        onChange={() => {
                          const updatedOptions = options.map((o) =>
                            o.id === opt.id ? { ...o, isCorrect: !o.isCorrect } : o
                          );
                          setOptions(updatedOptions);
                        }}
                        className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    ) : (
                      <OptionMarker />
                    )}

                    <input
                      type="text"
                      value={opt.text}
                      placeholder={`Option ${i + 1}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        const updatedOptions = options.map((o) =>
                          o.id === opt.id ? { ...o, text: value } : o
                        );
                        setOptions(updatedOptions);
                      }}
                      className={optionInputClass}
                    />
                    <RemoveOptionButton
                      onClick={() => {
                        const newOptions = options.filter((_, idx) => idx !== i);
                        setOptions(newOptions);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isChoiceType && (
            <button
              type="button"
              onClick={handleAddOption}
              className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-300 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
            >
              <Plus size={14} /> Add option
            </button>
          )}

          {isScreening && (dropState.choice || dropState.multipleChoice || dropState.short) && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Correct answer
              </label>
              <input
                type="text"
                value={
                  dropState.choice
                    ? options.find((option) => option.isCorrect && option.text.trim())?.text || ""
                    : dropState.multipleChoice
                    ? options
                        .filter((option) => option.isCorrect && option.text.trim())
                        .map((option) => option.text.trim())
                        .join(", ")
                    : correctAnswer
                }
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className={`${controlClass} read-only:bg-gray-50 read-only:text-gray-600`}
                readOnly={dropState.choice || dropState.multipleChoice}
                placeholder={
                  dropState.multipleChoice
                    ? "Correct answer(s) (auto-populated)"
                    : dropState.short
                    ? "Give a Single Keyword"
                    : "Correct answer (auto-populated)"
                }
              />
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500" aria-live="polite">
            {currentCount} input{currentCount === 1 ? "" : "s"} added to{" "}
            <span className="font-medium capitalize text-gray-700">{moduleLabel}</span>
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Toggle
                label="Allow File Upload"
                checked={allowFileUpload}
                onClick={() => setAllowFileUpload(!allowFileUpload)}
              />
              <Toggle
                label="Required"
                checked={enabled}
                onClick={() => setEnabled(!enabled)}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveScreeningInput}
              disabled={!questionText.trim()}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center">
        <button
          type="button"
          onClick={() => {
            if (hasUnsaved) {
              setPendingModule(null);
              setShowDiscard(true);
            } else {
              handleBack();
            }
          }}
          className="cursor-pointer rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
        >
          Back
        </button>
      </div>

      <ConfirmationModal
        isOpen={showDiscard}
        onClose={() => {
          setShowDiscard(false);
          setPendingModule(null);
        }}
        onConfirm={handleConfirmDiscard}
        title="Discard unsaved changes?"
        message="You have unsaved changes to this input. If you go back now, those changes will be lost."
      />
    </div>
  );
};

export default ScreeningPerModulePage;

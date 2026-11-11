import React, { useState } from "react";
import { ChevronDown, FileUser, Plus } from "lucide-react";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { HiOutlinePhotograph } from "react-icons/hi";
import { MdLocationOn } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import QuestionRenderer from "./ui/QuestionRenderer";
import ConfirmationModal from "./ui/ConfirmationModal";

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

const createId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const makeDefaultOptions = () => [
  { id: createId(), text: "", isCorrect: false },
  { id: createId(), text: "", isCorrect: false },
];

/**
 * Screening (UI Component)
 * Focused on rendering the Step 3 screening question form layout:
 * - Job details summary
 * - Question creator card (type selector, options, toggles)
 * - Saved screening questions list
 * - Confirmation modal & navigation footer
 */
const Screening = ({
  jobDetails = {},
  screeningQuestions: propScreeningQuestions,
  dropState: propDropState,
  questionText: propQuestionText,
  setQuestionText: propSetQuestionText,
  enabled: propEnabled,
  setEnabled: propSetEnabled,
  allowFileUpload: propAllowFileUpload,
  setAllowFileUpload: propSetAllowFileUpload,
  correctAnswer: propCorrectAnswer,
  setCorrectAnswer: propSetCorrectAnswer,
  options: propOptions,
  openDropdown: propOpenDropdown,
  setOpenDropdown: propSetOpenDropdown,
  editingQuestionId: propEditingQuestionId,
  setEditingQuestionId: propSetEditingQuestionId,
  deleteModal: propDeleteModal,
  onTypeChange: propOnTypeChange,
  onAddOption: propOnAddOption,
  onOptionTextChange: propOnOptionTextChange,
  onOptionRadioCorrect: propOnOptionRadioCorrect,
  onOptionCheckboxCorrect: propOnOptionCheckboxCorrect,
  onRemoveOption: propOnRemoveOption,
  onSaveScreening: propOnSaveScreening,
  onQuestionChange: propOnQuestionChange,
  onDeleteQuestion: propOnDeleteQuestion,
  onConfirmDelete: propOnConfirmDelete,
  onCloseDeleteModal: propOnCloseDeleteModal,
  onNextStep: propOnNextStep,
  onPrevStep: propOnPrevStep,
  // Legacy props fallback:
  formData = {},
  setFormData,
  nextStep,
  prevStep,
}) => {
  // Internal fallback state when props are not passed from ScreeningPage controller
  const [internalDropState, setInternalDropState] = useState({
    short: true,
    paragraph: false,
    choice: false,
    multipleChoice: false,
  });
  const [internalQuestionText, setInternalQuestionText] = useState("");
  const [internalEnabled, setInternalEnabled] = useState(false);
  const [internalAllowFile, setInternalAllowFile] = useState(false);
  const [internalCorrect, setInternalCorrect] = useState("");
  const [internalOptions, setInternalOptions] = useState(makeDefaultOptions);
  const [internalOpenDrop, setInternalOpenDrop] = useState(false);
  const [internalEditingId, setInternalEditingId] = useState(null);
  const [internalDeleteModal, setInternalDeleteModal] = useState({
    show: false,
    module: null,
    id: null,
  });

  const dropState = propDropState || internalDropState;
  const questionText =
    propQuestionText !== undefined ? propQuestionText : internalQuestionText;
  const setQuestionText = propSetQuestionText || setInternalQuestionText;
  const enabled = propEnabled !== undefined ? propEnabled : internalEnabled;
  const setEnabled = propSetEnabled || setInternalEnabled;
  const allowFileUpload =
    propAllowFileUpload !== undefined
      ? propAllowFileUpload
      : internalAllowFile;
  const setAllowFileUpload = propSetAllowFileUpload || setInternalAllowFile;
  const correctAnswer =
    propCorrectAnswer !== undefined ? propCorrectAnswer : internalCorrect;
  const setCorrectAnswer = propSetCorrectAnswer || setInternalCorrect;
  const options = propOptions || internalOptions;
  const openDropdown =
    propOpenDropdown !== undefined ? propOpenDropdown : internalOpenDrop;
  const setOpenDropdown = propSetOpenDropdown || setInternalOpenDrop;
  const editingQuestionId =
    propEditingQuestionId !== undefined
      ? propEditingQuestionId
      : internalEditingId;
  const setEditingQuestionId =
    propSetEditingQuestionId || setInternalEditingId;
  const deleteModal = propDeleteModal || internalDeleteModal;

  const screeningQuestions =
    propScreeningQuestions ||
    formData?.screeningQuestions?.screening ||
    [];

  const handleNext = propOnNextStep || nextStep || (() => {});
  const handlePrev = propOnPrevStep || prevStep || (() => {});

  const handleTypeChange =
    propOnTypeChange ||
    ((value) => {
      setInternalDropState({
        short: value === "short",
        paragraph: value === "paragraph",
        choice: value === "choice",
        multipleChoice: value === "multipleChoice",
      });
      setInternalCorrect("");
      setInternalOptions(makeDefaultOptions());
    });

  const handleAddOption =
    propOnAddOption ||
    (() => {
      setInternalOptions((prev) => [
        ...prev,
        { id: createId(), text: "", isCorrect: false },
      ]);
    });

  const handleOptionTextChange =
    propOnOptionTextChange ||
    ((id, text) => {
      setInternalOptions((prev) =>
        prev.map((opt) => (opt.id === id ? { ...opt, text } : opt))
      );
    });

  const handleOptionRadioCorrect =
    propOnOptionRadioCorrect ||
    ((id) => {
      setInternalOptions((prev) =>
        prev.map((opt) => ({
          ...opt,
          isCorrect: opt.id === id,
        }))
      );
    });

  const handleOptionCheckboxCorrect =
    propOnOptionCheckboxCorrect ||
    ((id) => {
      setInternalOptions((prev) =>
        prev.map((opt) =>
          opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt
        )
      );
    });

  const handleRemoveOption =
    propOnRemoveOption ||
    ((index) => {
      setInternalOptions((prev) => prev.filter((_, i) => i !== index));
    });

  const handleSave =
    propOnSaveScreening ||
    (() => {
      if (!questionText.trim()) return;
      if (typeof setFormData === "function") {
        const newId = createId();
        setFormData((prev) => {
          const prevQuestions = prev.screeningQuestions?.screening || [];
          return {
            ...prev,
            screeningQuestions: {
              ...prev.screeningQuestions,
              screening: [
                ...prevQuestions,
                {
                  id: newId,
                  fieldId: newId,
                  label: questionText.trim(),
                  type: dropState.choice
                    ? "choice"
                    : dropState.multipleChoice
                    ? "multipleChoice"
                    : dropState.paragraph
                    ? "paragraph"
                    : "short",
                  options: (dropState.choice || dropState.multipleChoice)
                    ? options.map((o) => o.text.trim()).filter(Boolean)
                    : [],
                  required: enabled,
                  placeholder: questionText.trim(),
                  allowFileUpload,
                  meta: { module: "screening", isScreening: true },
                },
              ],
            },
          };
        });
      }
      setQuestionText("");
      setEnabled(false);
      setAllowFileUpload(false);
      setInternalOptions(makeDefaultOptions());
    });

  const handleQuestionChange =
    propOnQuestionChange ||
    ((questionId, updates) => {
      if (typeof setFormData === "function") {
        setFormData((prev) => {
          const prevQuestions = prev.screeningQuestions?.screening || [];
          return {
            ...prev,
            screeningQuestions: {
              ...prev.screeningQuestions,
              screening: prevQuestions.map((q) =>
                q.id === questionId || q.fieldId === questionId
                  ? { ...q, ...updates }
                  : q
              ),
            },
          };
        });
      }
    });

  const handleDeleteQuestion =
    propOnDeleteQuestion ||
    ((questionId) => {
      setInternalDeleteModal({ show: true, module: "screening", id: questionId });
    });

  const handleConfirmDelete =
    propOnConfirmDelete ||
    (() => {
      const { id } = deleteModal;
      if (typeof setFormData === "function") {
        setFormData((prev) => ({
          ...prev,
          screeningQuestions: {
            ...prev.screeningQuestions,
            screening: (prev.screeningQuestions?.screening || []).filter(
              (q) => q.id !== id && q.fieldId !== id
            ),
          },
        }));
      }
      setInternalDeleteModal({ show: false, module: null, id: null });
    });

  const handleCloseDeleteModal =
    propOnCloseDeleteModal ||
    (() => {
      setInternalDeleteModal({ show: false, module: null, id: null });
    });

  const isChoiceType = dropState.choice || dropState.multipleChoice;
  const currentCount = screeningQuestions.length;

  return (
    <div className="w-full max-w-6xl px-4 py-6 sm:px-6">
      {/* Page heading */}
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <FileUser className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-gray-900 md:text-xl">
            Screening Questions
          </h2>
          <p className="text-xs text-gray-500 sm:text-sm">
            Add questions to filter and qualify applicants.
          </p>
        </div>
      </div>

      {/* Job summary card */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 bg-indigo-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-medium text-indigo-600">
              Job details
            </p>
            <h2 className="text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
              {jobDetails.jobTitle || "Job Position"}
            </h2>
          </div>
          {jobDetails.jobLocation && (
            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
              <MdLocationOn className="shrink-0 text-base text-gray-500" />
              {jobDetails.jobLocation}
            </span>
          )}
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_2fr] sm:gap-8 sm:p-7">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Experience required
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {jobDetails.experience || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Job description</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-600">
              {jobDetails.about ||
                jobDetails.description ||
                "No description provided."}
            </p>
          </div>
        </div>
      </section>

      {/* Question Creator Card */}
      <div className="mb-8 rounded-2xl border border-l-4 border-gray-200 border-l-indigo-600 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className={`${controlClass} md:flex-1 md:text-base`}
            placeholder="Type your screening question..."
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
                value={
                  dropState.short
                    ? "short"
                    : dropState.paragraph
                    ? "paragraph"
                    : dropState.choice
                    ? "choice"
                    : "multipleChoice"
                }
                className={`${controlClass} cursor-pointer appearance-none pl-9 pr-9`}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="short">Short Answer</option>
                <option value="paragraph">Paragraph</option>
                <option value="choice">Single Choice</option>
                <option value="multipleChoice">Multiple Choice</option>
              </select>
              <ChevronDown
                className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-transform ${
                  openDropdown ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Options & Preview */}
        <div className="mt-5 flex max-w-xl flex-col gap-4">
          {dropState.short && (
            <input
              type="text"
              className={controlClass}
              placeholder="Short Answer (candidate input)"
              disabled
            />
          )}

          {dropState.paragraph && (
            <textarea
              className={`${controlClass} resize-y`}
              placeholder="Paragraph Answer (candidate input)"
              rows={3}
              disabled
            />
          )}

          {dropState.choice && (
            <div>
              <p className="mb-2 text-xs text-gray-500">
                Use the radio button to mark the correct answer.
              </p>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={opt.isCorrect}
                      onChange={() => handleOptionRadioCorrect(opt.id)}
                      className="h-4 w-4 shrink-0 cursor-pointer border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={opt.text}
                      placeholder={`Option ${i + 1}`}
                      onChange={(e) =>
                        handleOptionTextChange(opt.id, e.target.value)
                      }
                      className={optionInputClass}
                    />
                    <RemoveOptionButton
                      onClick={() => handleRemoveOption(i)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {dropState.multipleChoice && (
            <div>
              <p className="mb-2 text-xs text-gray-500">
                Tick the checkboxes to mark the correct answers.
              </p>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={opt.isCorrect}
                      onChange={() => handleOptionCheckboxCorrect(opt.id)}
                      className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={opt.text}
                      placeholder={`Option ${i + 1}`}
                      onChange={(e) =>
                        handleOptionTextChange(opt.id, e.target.value)
                      }
                      className={optionInputClass}
                    />
                    <RemoveOptionButton
                      onClick={() => handleRemoveOption(i)}
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
              className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-300 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              <Plus size={14} /> Add option
            </button>
          )}

          {(dropState.choice || dropState.multipleChoice || dropState.short) && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Correct answer
              </label>
              <input
                type="text"
                value={
                  dropState.choice
                    ? options.find((o) => o.isCorrect && o.text.trim())?.text || ""
                    : dropState.multipleChoice
                    ? options
                        .filter((o) => o.isCorrect && o.text.trim())
                        .map((o) => o.text.trim())
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

        {/* Toggles & Save button */}
        <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {currentCount} screening question{currentCount === 1 ? "" : "s"} added
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
              onClick={handleSave}
              disabled={!questionText.trim()}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Question
            </button>
          </div>
        </div>
      </div>

      {/* Saved Questions List */}
      {screeningQuestions.length > 0 && (
        <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h3 className="mb-4 text-base font-semibold text-gray-800">
            Configured Screening Questions
          </h3>
          <div className="space-y-4">
            {screeningQuestions.map((q) => (
              <QuestionRenderer
                key={q.id || q.fieldId}
                question={q}
                isEditing={editingQuestionId === (q.id || q.fieldId)}
                onEdit={() => setEditingQuestionId(q.id || q.fieldId)}
                onSave={(updatedQ) => {
                  handleQuestionChange(q.id || q.fieldId, updatedQ);
                  setEditingQuestionId(null);
                }}
                onCancel={() => setEditingQuestionId(null)}
                onDelete={() => handleDeleteQuestion(q.id || q.fieldId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal?.show || false}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete question"
        message="Are you sure you want to remove this screening question? This cannot be undone."
      />

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={handlePrev}
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
        >
          Save and Continue
        </button>
      </div>
    </div>
  );
};

export default Screening;
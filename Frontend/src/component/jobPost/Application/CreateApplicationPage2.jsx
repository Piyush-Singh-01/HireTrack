import React, { useState } from "react";
import {
  MdWorkOutline,
  MdSignalCellularAlt,
  MdAttachFile,
  MdLocationOn,
} from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { FileUser } from "lucide-react";
import InputLabel from "./ui/InputLabel";
import QuestionRenderer from "./ui/QuestionRenderer";
import ConfirmationModal from "./ui/ConfirmationModal";

const selectClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-700 " +
  "shadow-sm disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

const checkboxClass =
  "h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed";

const FieldGrid = ({ children }) => (
  <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
    {children}
  </div>
);

const SelectField = ({ label, required, children }) => (
  <div className="flex flex-col">
    <label className="mb-1.5 text-sm font-medium text-gray-700">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const SectionHeader = ({ title, icon, description, children }) => (
  <div className="mb-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </span>
        <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
          {title}
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
    {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
  </div>
);

const AddInputButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
  >
    <FaPlus className="h-3 w-3" />
    Add Input
  </button>
);

/**
 * CreateApplicationPage2 (UI Component)
 * Focused on rendering the Step 2 form layout:
 * - Experience entries & custom questions
 * - Skills tags & custom questions
 * - Attachments configuration & custom questions
 * - Delete confirmation modal & navigation footer
 */
const CreateApplicationPage2 = ({
  jobDetails = {},
  formData = {},
  selectedModules = {},
  experienceQuestions = [],
  skillsQuestions = [],
  attachmentQuestions = [],
  addInfoQuestions = [],
  editingQuestionId = null,
  setEditingQuestionId = () => {},
  deleteModal = { show: false, module: null, id: null },
  onAddSkill = () => {},
  onRemoveSkill = () => {},
  onAddExperience = () => {},
  onRemoveExperience = () => {},
  onExperienceChange = () => {},
  onAddAttachment = () => {},
  onRemoveAttachment = () => {},
  onModuleConfigChange = () => {},
  onQuestionChange = () => {},
  onDeleteQuestion = () => {},
  onConfirmDelete = () => {},
  onCloseDeleteModal = () => {},
  onNavigateAddInput = () => {},
  onNextStep = () => {},
  onPrevStep = () => {},
  // Legacy prop support for compatibility:
  nextStep,
  prevStep,
  setFormData,
}) => {
  const [skillInputValue, setSkillInputValue] = useState("");

  const handleNext = onNextStep || nextStep || (() => {});
  const handlePrev = onPrevStep || prevStep || (() => {});

  const experiences = formData?.experience || [];
  const skills = formData?.skills || [];
  const attachments = formData?.attachments || [];

  const handleSkillSubmit = () => {
    if (skillInputValue.trim()) {
      onAddSkill(skillInputValue);
      setSkillInputValue("");
    }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSkillSubmit();
    }
  };

  return (
    <div className="w-full max-w-6xl px-4 py-6 sm:px-6">
      {/* Page heading */}
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <FileUser className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-bold text-gray-900 md:text-xl">
          Application Form Setup
        </h2>
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

      {/* Section 1: Experience (conditional) */}
      {selectedModules?.experience && (
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeader
            title="Work Experience"
            icon={<MdWorkOutline className="text-xl" />}
          >
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={
                    formData.moduleConfig?.experience?.allowMultipleEntries ?? true
                  }
                  onChange={(e) =>
                    onModuleConfigChange("experience", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Multiple entries
              </label>
              <AddInputButton onClick={() => onNavigateAddInput("experience")} />
            </div>
          </SectionHeader>

          {experiences.map((exp, index) => (
            <div
              key={index}
              className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Experience entry #{index + 1}
                </span>
                {experiences.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveExperience(index)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <FieldGrid>
                <InputLabel
                  label="Company Name"
                  value={exp.companyName || ""}
                  onChange={(e) =>
                    onExperienceChange(index, "companyName", e.target.value)
                  }
                  placeholder="e.g. Acme Corp"
                  required
                  disabled
                />
                <InputLabel
                  label="Role / Title"
                  value={exp.role || ""}
                  onChange={(e) =>
                    onExperienceChange(index, "role", e.target.value)
                  }
                  placeholder="e.g. Software Engineer"
                  required
                  disabled
                />
                <InputLabel
                  label="Start Date"
                  type="date"
                  value={exp.startDate || ""}
                  onChange={(e) =>
                    onExperienceChange(index, "startDate", e.target.value)
                  }
                  required
                  disabled
                />
                <InputLabel
                  label="End Date"
                  type="date"
                  value={exp.endDate || ""}
                  onChange={(e) =>
                    onExperienceChange(index, "endDate", e.target.value)
                  }
                  disabled
                />
                <InputLabel
                  label="Current CTC"
                  value={exp.currentCTC || ""}
                  onChange={(e) =>
                    onExperienceChange(index, "currentCTC", e.target.value)
                  }
                  placeholder="e.g. 10 LPA"
                  disabled
                />
                <InputLabel
                  label="Expected CTC"
                  value={exp.expectedCTC || ""}
                  onChange={(e) =>
                    onExperienceChange(index, "expectedCTC", e.target.value)
                  }
                  placeholder="e.g. 15 LPA"
                  disabled
                />
                <InputLabel
                  label="Notice Period (Days)"
                  value={exp.noticePeriod || ""}
                  onChange={(e) =>
                    onExperienceChange(index, "noticePeriod", e.target.value)
                  }
                  placeholder="e.g. 30"
                  disabled
                />
              </FieldGrid>
            </div>
          ))}

          {(formData.moduleConfig?.experience?.allowMultipleEntries ?? true) && (
            <button
              type="button"
              onClick={onAddExperience}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              <FaPlus className="h-3 w-3" />
              Add another experience
            </button>
          )}

          {experienceQuestions.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Additional questions (Work Experience)
              </h3>
              <div className="space-y-4">
                {experienceQuestions.map((q) => (
                  <QuestionRenderer
                    key={q.id || q.fieldId}
                    question={q}
                    isEditing={editingQuestionId === (q.id || q.fieldId)}
                    onEdit={() => setEditingQuestionId(q.id || q.fieldId)}
                    onSave={(updatedQ) => {
                      onQuestionChange("experience", q.id || q.fieldId, updatedQ);
                      setEditingQuestionId(null);
                    }}
                    onCancel={() => setEditingQuestionId(null)}
                    onDelete={() =>
                      onDeleteQuestion("experience", q.id || q.fieldId)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Section 2: Skills (conditional) */}
      {selectedModules?.skills && (
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeader
            title="Skills & Technologies"
            icon={<MdSignalCellularAlt className="text-xl" />}
          >
            <AddInputButton onClick={() => onNavigateAddInput("skills")} />
          </SectionHeader>

          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInputValue}
                onChange={(e) => setSkillInputValue(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter (e.g. React, Node.js)"
                className="flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={handleSkillSubmit}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => onRemoveSkill(skill)}
                    className="cursor-pointer text-indigo-400 hover:text-indigo-600"
                  >
                    <IoClose className="text-base" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {skillsQuestions.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Additional questions (Skills)
              </h3>
              <div className="space-y-4">
                {skillsQuestions.map((q) => (
                  <QuestionRenderer
                    key={q.id || q.fieldId}
                    question={q}
                    isEditing={editingQuestionId === (q.id || q.fieldId)}
                    onEdit={() => setEditingQuestionId(q.id || q.fieldId)}
                    onSave={(updatedQ) => {
                      onQuestionChange("skills", q.id || q.fieldId, updatedQ);
                      setEditingQuestionId(null);
                    }}
                    onCancel={() => setEditingQuestionId(null)}
                    onDelete={() =>
                      onDeleteQuestion("skills", q.id || q.fieldId)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Section 3: Attachments (conditional) */}
      {selectedModules?.attachments && (
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeader
            title="Attachments & Documents"
            icon={<MdAttachFile className="text-xl" />}
          >
            <AddInputButton onClick={() => onNavigateAddInput("attachments")} />
          </SectionHeader>

          <FieldGrid>
            <SelectField label="Resume / CV" required>
              <select disabled className={selectClass} defaultValue="required">
                <option value="required">Required</option>
                <option value="optional">Optional</option>
              </select>
            </SelectField>

            <SelectField label="Cover Letter">
              <select disabled className={selectClass} defaultValue="optional">
                <option value="optional">Optional</option>
                <option value="required">Required</option>
                <option value="off">Off</option>
              </select>
            </SelectField>
          </FieldGrid>

          {attachmentQuestions.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Additional questions (Attachments)
              </h3>
              <div className="space-y-4">
                {attachmentQuestions.map((q) => (
                  <QuestionRenderer
                    key={q.id || q.fieldId}
                    question={q}
                    isEditing={editingQuestionId === (q.id || q.fieldId)}
                    onEdit={() => setEditingQuestionId(q.id || q.fieldId)}
                    onSave={(updatedQ) => {
                      onQuestionChange("attachments", q.id || q.fieldId, updatedQ);
                      setEditingQuestionId(null);
                    }}
                    onCancel={() => setEditingQuestionId(null)}
                    onDelete={() =>
                      onDeleteQuestion("attachments", q.id || q.fieldId)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Additional info questions if any */}
      {addInfoQuestions.length > 0 && (
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h3 className="mb-4 text-base font-semibold text-gray-800">
            Additional Questions
          </h3>
          <div className="space-y-4">
            {addInfoQuestions.map((q) => (
              <QuestionRenderer
                key={q.id || q.fieldId}
                question={q}
                isEditing={editingQuestionId === (q.id || q.fieldId)}
                onEdit={() => setEditingQuestionId(q.id || q.fieldId)}
                onSave={(updatedQ) => {
                  onQuestionChange("addInfo", q.id || q.fieldId, updatedQ);
                  setEditingQuestionId(null);
                }}
                onCancel={() => setEditingQuestionId(null)}
                onDelete={() => onDeleteQuestion("addInfo", q.id || q.fieldId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal?.show || false}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
        title="Delete question"
        message="Are you sure you want to remove this question? This cannot be undone."
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

export default CreateApplicationPage2;
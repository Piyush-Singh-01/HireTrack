import React from "react";
import { MdBusiness, MdLocationOn } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { PiGraduationCapLight } from "react-icons/pi";
import { FileUser } from "lucide-react";
import InputLabel from "./ui/InputLabel";
import QuestionRenderer from "./ui/QuestionRenderer";
import ConfirmationModal from "./ui/ConfirmationModal";

const selectClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-700 " +
  "shadow-sm disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

const FieldGrid = ({ children }) => (
  <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
    {children}
  </div>
);

const SubHeading = ({ children }) => (
  <h3 className="mb-3 text-sm font-semibold text-gray-700">{children}</h3>
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
 * CreateApplication (UI Component)
 * Focused on rendering the Step 1 form layout:
 * - Job details summary
 * - Personal Information fields & custom questions
 * - Education entries & custom questions
 * - Delete confirmation modal & navigation footer
 */
const CreateApplication = ({
  jobDetails = {},
  formData = {},
  selectedModules = {},
  isLoading = false,
  personalQuestions = [],
  educationQuestions = [],
  editingQuestionId = null,
  setEditingQuestionId = () => {},
  deleteModal = { show: false, module: null, id: null },
  onPersonalChange = () => {},
  onAddEducation = () => {},
  onRemoveEducation = () => {},
  onEducationChange = () => {},
  onPursuingChange = () => {},
  onModuleConfigChange = () => {},
  onQuestionChange = () => {},
  onDeleteQuestion = () => {},
  onConfirmDelete = () => {},
  onCloseDeleteModal = () => {},
  onNavigateAddInput = () => {},
  onNextStep = () => {},
  // Legacy prop support for compatibility:
  nextStep,
  setFormData,
}) => {
  const handleSaveAndContinue = onNextStep || nextStep || (() => {});

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-3 py-24 text-sm text-gray-500"
      >
        <svg
          className="h-5 w-5 animate-spin text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        Loading application form...
      </div>
    );
  }

  const educations = formData?.education || [];

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

      {/* Section 1: Personal Information */}
      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeader
          title="Personal Information"
          icon={<MdBusiness className="text-lg" />}
        >
          <AddInputButton onClick={() => onNavigateAddInput("personalInfo")} />
        </SectionHeader>

        <SubHeading>Full name</SubHeading>
        <FieldGrid>
          <InputLabel
            label="First Name"
            name="firstName"
            value={formData.firstName || ""}
            onChange={onPersonalChange}
            placeholder="First name"
            required
            disabled
          />
          <InputLabel
            label="Middle Name"
            name="middleName"
            value={formData.middleName || ""}
            onChange={onPersonalChange}
            placeholder="Middle name"
            disabled
          />
          <InputLabel
            label="Last Name"
            name="lastName"
            value={formData.lastName || ""}
            onChange={onPersonalChange}
            placeholder="Last name"
            required
            disabled
          />
        </FieldGrid>

        <div className="my-6 border-t border-gray-100" />

        <SubHeading>Gender & Identity</SubHeading>
        <FieldGrid>
          <SelectField label="Gender" required>
            <select
              disabled
              name="gender"
              value={formData.gender || ""}
              onChange={onPersonalChange}
              className={selectClass}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </SelectField>
        </FieldGrid>

        <div className="my-6 border-t border-gray-100" />

        <SubHeading>Address</SubHeading>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputLabel
              label="Address line 1"
              name="address1"
              value={formData.address1 || ""}
              onChange={onPersonalChange}
              placeholder="Street address"
              required
              disabled
            />
            <InputLabel
              label="Address line 2"
              name="address2"
              value={formData.address2 || ""}
              onChange={onPersonalChange}
              placeholder="Apartment, suite, unit (optional)"
              disabled
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InputLabel
              label="City"
              name="city"
              value={formData.city || ""}
              onChange={onPersonalChange}
              placeholder="City"
              required
              disabled
            />
            <InputLabel
              label="Postal code"
              name="postalCode"
              value={formData.postalCode || ""}
              onChange={onPersonalChange}
              placeholder="e.g. 600001"
              required
              disabled
            />
            <InputLabel
              label="State / Province"
              name="state"
              value={formData.state || ""}
              onChange={onPersonalChange}
              placeholder="State"
              required
              disabled
            />
            <InputLabel
              label="Country"
              name="country"
              value={formData.country || ""}
              onChange={onPersonalChange}
              placeholder="Country"
              required
              disabled
            />
          </div>
        </div>

        <div className="my-6 border-t border-gray-100" />

        <SubHeading>Contact details</SubHeading>
        <FieldGrid>
          <InputLabel
            label="Email address"
            name="email"
            type="email"
            value={formData.email || ""}
            onChange={onPersonalChange}
            placeholder="candidate@example.com"
            required
            disabled
          />
          <InputLabel
            label="Phone number"
            name="contactNumber"
            type="tel"
            value={formData.contactNumber || ""}
            onChange={onPersonalChange}
            placeholder="+91 98765 43210"
            required
            disabled
          />
          <SelectField label="Experience level">
            <select
              disabled
              name="experienceLevel"
              value={formData.experienceLevel || ""}
              onChange={onPersonalChange}
              className={selectClass}
            >
              <option value="">Select experience level</option>
              <option value="fresher">Fresher</option>
              <option value="1-3">1 - 3 years</option>
              <option value="3-5">3 - 5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </SelectField>
        </FieldGrid>

        {personalQuestions.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-5">
            <SubHeading>Additional questions (Personal Info)</SubHeading>
            <div className="space-y-4">
              {personalQuestions.map((q) => (
                <QuestionRenderer
                  key={q.id || q.fieldId}
                  question={q}
                  isEditing={editingQuestionId === (q.id || q.fieldId)}
                  onEdit={() => setEditingQuestionId(q.id || q.fieldId)}
                  onSave={(updatedQ) => {
                    onQuestionChange("personalInfo", q.id || q.fieldId, updatedQ);
                    setEditingQuestionId(null);
                  }}
                  onCancel={() => setEditingQuestionId(null)}
                  onDelete={() => onDeleteQuestion("personalInfo", q.id || q.fieldId)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Education (conditional) */}
      {selectedModules?.education && (
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeader
            title="Education"
            icon={<PiGraduationCapLight className="text-xl" />}
          >
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={
                    formData.moduleConfig?.education?.allowMultipleEntries ?? true
                  }
                  onChange={(e) =>
                    onModuleConfigChange("education", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Multiple entries
              </label>
              <AddInputButton onClick={() => onNavigateAddInput("education")} />
            </div>
          </SectionHeader>

          {educations.map((edu, index) => (
            <div
              key={index}
              className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Education entry #{index + 1}
                </span>
                {educations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveEducation(index)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <FieldGrid>
                <InputLabel
                  label="Institution / School"
                  value={edu.institution || ""}
                  onChange={(e) =>
                    onEducationChange(index, "institution", e.target.value)
                  }
                  placeholder="e.g. Anna University"
                  required
                  disabled
                />
                <SelectField label="Degree level" required>
                  <select
                    disabled
                    value={edu.degreeLevel || ""}
                    onChange={(e) =>
                      onEducationChange(index, "degreeLevel", e.target.value)
                    }
                    className={selectClass}
                  >
                    <option value="">Select degree level</option>
                    <option value="highschool">High School</option>
                    <option value="associate">Associate's</option>
                    <option value="bachelor">Bachelor's</option>
                    <option value="master">Master's</option>
                    <option value="doctorate">Doctorate / Ph.D.</option>
                  </select>
                </SelectField>
                <InputLabel
                  label="Major / Field of study"
                  value={edu.program || ""}
                  onChange={(e) =>
                    onEducationChange(index, "program", e.target.value)
                  }
                  placeholder="e.g. Computer Science"
                  required
                  disabled
                />
              </FieldGrid>

              <div className="mt-4">
                <FieldGrid>
                  <InputLabel
                    label="Start date"
                    type="date"
                    value={edu.startDate || ""}
                    onChange={(e) =>
                      onEducationChange(index, "startDate", e.target.value)
                    }
                    required
                    disabled
                  />
                  <InputLabel
                    label="End date"
                    type="date"
                    value={edu.endDate || ""}
                    onChange={(e) =>
                      onEducationChange(index, "endDate", e.target.value)
                    }
                    disabled
                  />
                  {!edu.pursuing && (
                    <InputLabel
                      label="Year of graduation"
                      type="number"
                      value={edu.yearOfGraduation || ""}
                      onChange={(e) =>
                        onEducationChange(
                          index,
                          "yearOfGraduation",
                          e.target.value
                        )
                      }
                      placeholder="e.g. 2024"
                      disabled
                    />
                  )}
                  <InputLabel
                    label="GPA / Percentage"
                    value={edu.gpaOrPercent || ""}
                    onChange={(e) =>
                      onEducationChange(index, "gpaOrPercent", e.target.value)
                    }
                    placeholder="e.g. 8.5 CGPA or 85%"
                    disabled
                  />
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={edu.pursuing || false}
                        onChange={(e) =>
                          onPursuingChange(index, e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        disabled
                      />
                      Currently pursuing
                    </label>
                  </div>
                </FieldGrid>
              </div>
            </div>
          ))}

          {(formData.moduleConfig?.education?.allowMultipleEntries ?? true) && (
            <button
              type="button"
              onClick={onAddEducation}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              <FaPlus className="h-3 w-3" />
              Add another education
            </button>
          )}

          {educationQuestions.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <SubHeading>Additional questions (Education)</SubHeading>
              <div className="space-y-4">
                {educationQuestions.map((q) => (
                  <QuestionRenderer
                    key={q.id || q.fieldId}
                    question={q}
                    isEditing={editingQuestionId === (q.id || q.fieldId)}
                    onEdit={() => setEditingQuestionId(q.id || q.fieldId)}
                    onSave={(updatedQ) => {
                      onQuestionChange("education", q.id || q.fieldId, updatedQ);
                      setEditingQuestionId(null);
                    }}
                    onCancel={() => setEditingQuestionId(null)}
                    onDelete={() => onDeleteQuestion("education", q.id || q.fieldId)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Delete Question Modal */}
      <ConfirmationModal
        isOpen={deleteModal?.show || false}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
        title="Delete question"
        message="Are you sure you want to remove this question? This cannot be undone."
      />

      {/* Footer Navigation */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleSaveAndContinue}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
        >
          Save and Continue
        </button>
      </div>
    </div>
  );
};

export default CreateApplication;
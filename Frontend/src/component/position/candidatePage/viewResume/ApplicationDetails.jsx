import React from "react";
import {
  SectionCard,
  SubHeading,
  AnswerField,
  EmptyNote,
  UserIcon,
  FileIcon,
  formatDateValue,
} from "./shared";

/**
 * ApplicationDetails
 * Displays the candidate's submitted application data including personal info,
 * education, experience, skills, attachments, and screening questions.
 */
const ApplicationDetails = ({
  primaryAnswers,
  customAnswers,
  educationEntries,
  experienceEntries,
  skills,
  resumeUrl,
  connectionError,
}) => (
  <SectionCard
    title="Application"
    subtitle="Candidate-submitted details for HR review"
    icon={<UserIcon />}
    accent="from-indigo-500 to-blue-500"
  >
    <div className="space-y-10">
      {/* Personal Information */}
      <div>
        <SubHeading>Personal Information</SubHeading>
        <div className="grid gap-4 md:grid-cols-2">
          {primaryAnswers.map((item, idx) => (
            <AnswerField key={idx} label={item.label} value={item.value} />
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <SubHeading>Education</SubHeading>
        {educationEntries.length > 0 ? (
          <div className="space-y-4">
            {educationEntries.map((entry, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white p-4 md:grid-cols-2 md:p-5"
              >
                <AnswerField label="Institution*" value={entry.institution} />
                <AnswerField label="Degree Level*" value={entry.degreeLevel} />
                <AnswerField label="Program*" value={entry.program} />
                <AnswerField label="Start Date*" value={formatDateValue(entry.startDate)} />
                <AnswerField label="End Date*" value={formatDateValue(entry.endDate)} />
                <AnswerField
                  label="Year of Graduation*"
                  value={entry.yearOfGraduation}
                />
                <AnswerField label="GPA/Percentage*" value={entry.gpaOrPercent} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyNote>No education details available.</EmptyNote>
        )}
      </div>

      {/* Experience */}
      <div>
        <SubHeading>Experience</SubHeading>
        {experienceEntries.length > 0 ? (
          <div className="space-y-4">
            {experienceEntries.map((entry, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/60 to-white p-4 md:grid-cols-2 md:p-5"
              >
                <AnswerField label="Company Name*" value={entry.companyName} />
                <AnswerField label="Role*" value={entry.role} />
                <AnswerField
                  label="Start Date*"
                  value={formatDateValue(entry.expStart || entry.startDate)}
                />
                <AnswerField
                  label="End Date*"
                  value={formatDateValue(entry.expEnd || entry.endDate)}
                />
                <AnswerField
                  label="Responsibility*"
                  value={entry.responsibility}
                  className="md:col-span-2"
                />
                <AnswerField label="Current CTC*" value={entry.currentCTC} />
                <AnswerField label="Expected CTC*" value={entry.expectedCTC} />
                <AnswerField label="Notice Period*" value={entry.noticePeriod} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyNote>No experience details available.</EmptyNote>
        )}

        {/* Skills and Attachments */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h4 className="mb-3 text-sm font-bold text-slate-800">Skills *</h4>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-indigo-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No skills provided.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h4 className="mb-3 text-sm font-bold text-slate-800">
              Attachments (Resume) *
            </h4>
            {resumeUrl && !connectionError ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue/10 px-3 py-2 text-sm font-semibold text-blue transition-colors hover:bg-blue hover:text-white"
              >
                <FileIcon />
                View Resume File
              </a>
            ) : (
              <p className="text-sm text-slate-500">No file chosen</p>
            )}
          </div>
        </div>
      </div>

      {/* Custom / Screening Questions */}
      {customAnswers.length > 0 && (
        <div>
          <SubHeading>Screening Questions</SubHeading>
          <div className="space-y-3">
            {customAnswers.map((ans, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 text-sm font-semibold text-slate-800">
                  <span className="mr-2 rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                    Q{index + 1}
                  </span>
                  {ans.label}
                </div>
                <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Answer marked:</span>{" "}
                  {ans.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </SectionCard>
);

export default ApplicationDetails;

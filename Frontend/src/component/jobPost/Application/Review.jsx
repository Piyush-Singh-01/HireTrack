import React, { useState } from "react";
import { CiFileOn } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa6";
import { HiOutlineDocument } from "react-icons/hi";
import {
  MdAttachFile,
  MdEdit,
  MdSignalCellularAlt,
  MdLocationOn,
} from "react-icons/md";
import { PiGraduationCapLight } from "react-icons/pi";
import { FileUser } from "lucide-react";
import { useJobpost } from "../../../hooks/useJobpost";
import useForm from "../../../hooks/useForm";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import QuestionRenderer from "./ui/QuestionRenderer";
import axiosInstance from "../../../utils/AxiosInstance";
import ApiRoutes from "../../../utils/ApiRoutes";
import { useToast } from "../../../utils/ToastContext";

const Review = ({
  formData,
  selectedModules = {},
  prevStep,
  goToStep,
  jobDetails,
}) => {
  const { createJob, updatejobpost, updatejobdraft } = useJobpost();
  const { createForm } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [createdAppId, setCreatedAppId] = useState(null);

  const handleSubmit = async () => {
    try {
      console.log("Submitting job application configuration...");
      
      const { jobCode, companyInfo, ...restDetails } = jobDetails;
      const jobPayload = {
        ...restDetails,
        jobTitle: jobDetails.jobTitle || "",
        jobRole: jobDetails.jobRole || "",
        jobLocation: jobDetails.jobLocation || "",
        department: jobDetails.department || "",
        jobType: jobDetails.jobType || "",
        experience: jobDetails.experience || "",
        about: jobDetails.about || jobDetails.description || "",
        isDraft: typeof jobDetails?.isDraft === "boolean" ? jobDetails.isDraft : true,
      };

      const cachedJobId = localStorage.getItem("jobDraftId");

      let job;
      if (cachedJobId) {
        console.log("Updating existing job:", cachedJobId);
        const updater = jobPayload.isDraft ? updatejobdraft : updatejobpost;
        try {
          const res = await updater.mutateAsync({ jobId: cachedJobId, updatedData: jobPayload });
          job = res?.data?.data || res?.data || res;
        } catch (err) {
          if (err?.response?.status === 404 && jobPayload.isDraft) {
            console.log("Draft not found, attempting to update as published job");
            const res = await updatejobpost.mutateAsync({ jobId: cachedJobId, updatedData: jobPayload });
            job = res?.data?.data || res?.data || res;
          } else {
            throw err;
          }
        }
      } else {
        console.log("Creating new job");
        const res = await createJob.mutateAsync(jobPayload);
        job = res?.data?.data || res?.data || res;
      }

      const jobId = job?._id;
      if (!jobId) throw new Error("Missing jobId after job save/create");
      
      localStorage.setItem("jobDraftId", jobId);
      setCreatedAppId(jobId);

      const mapFieldType = (type) => {
        const typeMap = {
          short: "text", paragraph: "textarea", choice: "radio", multipleChoice: "checkbox",
          textOnly: "text", text: "text", textarea: "textarea", radio: "radio",
          checkbox: "checkbox", file: "file", select: "select",
        };
        return typeMap[type] || type || "text";
      };

      const buildScreeningPayload = (modules) => {
        return Object.entries(modules || {}).flatMap(([module, fields]) =>
          (fields || []).map((field) => ({
            fieldId: field.fieldId || field.id || `f-${crypto.randomUUID()}`,
            module,
            question: field.label || "Untitled Question",
            type: mapFieldType(field.type),
            choices: field.options || [],
            required: Boolean(field.required),
            allowFileUpload: Boolean(field.allowFileUpload),
            fileConfig: field.allowFileUpload ? field.fileConfig : undefined,
            correctAnswer: module === "screening" ? field.correctAnswer ?? null : null,
          }))
        );
      };

      const screeningPayload = buildScreeningPayload(formData.screeningQuestions);
      let screeningId = job?.screeningId;

      if (screeningPayload.length > 0) {
        console.log("Saving screening questions...");
        try {
          const screeningRes = await axiosInstance.post(ApiRoutes.SCREENING.CREATE, {
            jobId,
            screen: screeningPayload,
          });
          const createdScreening = screeningRes?.data?.data || screeningRes?.data;
          screeningId = createdScreening?._id || createdScreening?.id || screeningId;
        } catch (err) {
          console.error("Screening save error:", err);
          showToast("Screening questions could not be saved to dedicated model. They will be included in the form metadata.", "warning");
        }
      }

      const flattenModulesToFields = (modules) => {
        return Object.entries(modules || {}).flatMap(([module, fields]) =>
          (fields || []).map((field) => ({
            fieldId: field.fieldId || field.id || `f-${crypto.randomUUID()}`,
            label: field.label || "Untitled Question",
            type: mapFieldType(field.type),
            allowFileUpload: Boolean(field.allowFileUpload),
            fileConfig: field.allowFileUpload ? field.fileConfig : undefined,
            options: field.options || [],
            required: Boolean(field.required),
            placeholder: field.placeholder,
            defaultValue: field.defaultValue,
            meta: {
              ...field.meta,
              module,
              isScreening: Boolean(field.meta?.isScreening),
            },
          }))
        );
      };

      let flattenedFields = flattenModulesToFields(formData.screeningQuestions).filter(Boolean);
      if (flattenedFields.length === 0) {
        flattenedFields = [{
          fieldId: `f-${crypto.randomUUID()}`,
          label: "Full Name",
          type: "text",
          required: true,
          placeholder: "Full name",
          meta: { module: "personalInfo", isScreening: false },
        }];
      }

      const formPayload = {
        jobId,
        title: `Application Form for ${job.jobTitle}`,
        description: "Please fill out the following details.",
        fields: flattenedFields,
        moduleConfig: formData?.moduleConfig || {},
        selectedModules: selectedModules || {},
      };

      let formResult;
      const existingFormId = job?.formId?._id || job?.formId;

      if (existingFormId && typeof existingFormId === "string") {
        console.log("Updating existing form:", existingFormId);
        const res = await axiosInstance.put(ApiRoutes.FORM.EDIT_FORM(existingFormId), formPayload);
        formResult = res?.data?.data || res?.data;
      } else {
        console.log("Ensuring form exists via POST...");
        try {
          const res = await createForm(formPayload);
          formResult = res?.data || res;
        } catch (err) {
          const msg = err?.response?.data?.message || err.message || "";
          if (msg.includes("already exists")) {
            console.log("Duplicate form found during POST, fetching instead...");
            const existingRes = await axiosInstance.get(ApiRoutes.FORM.GET_ALL_FORM, { params: { jobId } });
            const forms = existingRes?.data?.data || [];
            const activeForm = forms.find(f => f.isActive) || forms[0];
            if (activeForm?._id) {
              const updateRes = await axiosInstance.put(ApiRoutes.FORM.EDIT_FORM(activeForm._id), formPayload);
              formResult = updateRes?.data?.data || updateRes?.data;
            }
          } else {
            throw err;
          }
        }
      }

      if (!formResult?._id) throw new Error("Could not obtain formId for this job");

      console.log("Finalizing job with formId:", formResult._id);
      const finalUpdater = job?.isDraft ? updatejobdraft : updatejobpost;
      const finalRes = await finalUpdater.mutateAsync({
        jobId,
        updatedData: { formId: formResult._id, screeningId },
      });

      const updatedJob = finalRes?.data?.data || finalRes?.data || finalRes;
      const link =
        updatedJob?.applicationLink ||
        (updatedJob?.applicationSlug ? `/apply/${updatedJob.applicationSlug}` : "") ||
        job?.applicationLink ||
        (job?.applicationSlug ? `/apply/${job.applicationSlug}` : "") ||
        (jobId ? `/apply/${jobId}` : "");

      showToast(jobPayload.isDraft ? "Draft saved successfully" : "Job published successfully", "success");

      console.log("Navigation to application page with link:", link);
      navigate("/jobapplication", {
        state: {
          generatedLink: link,
          jobId: jobId,
        },
      });

    } catch (err) {
      console.error("Submission failed:", err);
      const errMsg = err?.response?.data?.message || err.message || "Unknown error";
      showToast(`Submission failed: ${errMsg}`, "error");
    }
  };

  return (
    <div className="max-w-5xl px-4 md:px-2 py-2">
      {/* Header Title */}
      <div className="flex items-center gap-2.5 text-indigo-600 mb-6">
        <div className="p-2 bg-indigo-50 rounded-xl">
          <FileUser className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Review Application Setup
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Verify all details and custom questions before generating your application link.
          </p>
        </div>
      </div>

      {/* Job Details Banner Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 md:p-8 rounded-2xl shadow-sm mb-8 border border-indigo-700/50">
        <h2 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">
          {jobDetails?.jobTitle || "Junior Frontend Developer"}
        </h2>

        <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-100 mb-4">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
            <MdLocationOn className="text-indigo-300 text-base" />
            <span>{jobDetails?.jobLocation || "Chennai"}</span>
          </div>

          {jobDetails?.experience && (
            <div className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
              <span className="text-indigo-200">Experience:</span>{" "}
              <span className="font-semibold text-white">{jobDetails.experience}</span>
            </div>
          )}
        </div>

        {(jobDetails?.about || jobDetails?.description) && (
          <div className="border-t border-indigo-700/60 pt-3 mt-3">
            <p className="text-xs uppercase font-semibold tracking-wider text-indigo-300 mb-1">
              About the Position
            </p>
            <p className="text-xs md:text-sm text-indigo-100/90 leading-relaxed line-clamp-3">
              {jobDetails.about || jobDetails.description}
            </p>
          </div>
        )}
      </div>

      {/* Review Content Container */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
        {/* Personal Information Section */}
        <div className="pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FaRegUser className="w-5 h-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Personal Information
              </h3>
            </div>
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <MdEdit size={14} /> Edit
            </button>
          </div>

          <div className="space-y-3">
            <QuestionRenderer
              questions={formData?.screeningQuestions?.personalInfo}
              module="personalInfo"
              readOnly={true}
              setEditingQuestionId={() => {}}
              onQuestionChange={() => {}}
              onDelete={() => {}}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/60 p-4 rounded-xl border border-gray-200/60 text-sm">
              <div className="flex justify-between sm:justify-start gap-4">
                <span className="text-gray-500 w-32">First Name:</span>
                <span className="font-semibold text-gray-800">{formData?.firstName || "-"}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4">
                <span className="text-gray-500 w-32">Middle Name:</span>
                <span className="font-semibold text-gray-800">{formData?.middleName || "-"}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4">
                <span className="text-gray-500 w-32">Last Name:</span>
                <span className="font-semibold text-gray-800">{formData?.lastName || "-"}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4">
                <span className="text-gray-500 w-32">Email:</span>
                <span className="font-semibold text-gray-800">{formData?.email || "-"}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4">
                <span className="text-gray-500 w-32">Contact:</span>
                <span className="font-semibold text-gray-800">{formData?.contactNumber || "-"}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4">
                <span className="text-gray-500 w-32">City:</span>
                <span className="font-semibold text-gray-800">{formData?.city || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Education Section */}
        {selectedModules.education && (
          <div className="pb-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <PiGraduationCapLight className="w-5 h-5" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  Education
                </h3>
              </div>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <MdEdit size={14} /> Edit
              </button>
            </div>

            <div className="space-y-4">
              <QuestionRenderer
                questions={formData?.screeningQuestions?.education}
                module="education"
                readOnly={true}
                setEditingQuestionId={() => {}}
                onQuestionChange={() => {}}
                onDelete={() => {}}
              />

              {Array.isArray(formData?.education) &&
                formData.education.map((edu, idx) => (
                  <div key={idx} className="bg-gray-50/60 p-4 rounded-xl border border-gray-200/60 text-sm space-y-2">
                    <div className="flex justify-between sm:justify-start gap-4">
                      <span className="text-gray-500 w-36">Institution:</span>
                      <span className="font-semibold text-gray-800">{edu.institution || "-"}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start gap-4">
                      <span className="text-gray-500 w-36">Degree Level:</span>
                      <span className="font-semibold text-gray-800">{edu.degreeLevel || "-"}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start gap-4">
                      <span className="text-gray-500 w-36">Program:</span>
                      <span className="font-semibold text-gray-800">{edu.program || "-"}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start gap-4">
                      <span className="text-gray-500 w-36">Graduation Year:</span>
                      <span className="font-semibold text-gray-800">{edu.yearOfGraduation || "-"}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {selectedModules.experience && (
          <div className="pb-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <PiGraduationCapLight className="w-5 h-5" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  Experience
                </h3>
              </div>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <MdEdit size={14} /> Edit
              </button>
            </div>

            <div className="space-y-4">
              <QuestionRenderer
                questions={formData?.screeningQuestions?.experience}
                module="experience"
                readOnly={true}
                setEditingQuestionId={() => {}}
                onQuestionChange={() => {}}
                onDelete={() => {}}
              />

              {Array.isArray(formData?.experience) &&
                formData.experience.map((exp, idx) => (
                  <div key={idx} className="bg-gray-50/60 p-4 rounded-xl border border-gray-200/60 text-sm space-y-2">
                    <div className="flex justify-between sm:justify-start gap-4">
                      <span className="text-gray-500 w-36">Company Name:</span>
                      <span className="font-semibold text-gray-800">{exp.companyName || "-"}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start gap-4">
                      <span className="text-gray-500 w-36">Role:</span>
                      <span className="font-semibold text-gray-800">{exp.role || "-"}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start gap-4">
                      <span className="text-gray-500 w-36">Responsibility:</span>
                      <span className="font-semibold text-gray-800">{exp.responsibility || "-"}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start gap-4">
                      <span className="text-gray-500 w-36">Current CTC:</span>
                      <span className="font-semibold text-gray-800">{exp.currentCTC || "-"}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Screening Questions Section */}
        {selectedModules.screening && (
          <div className="pb-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <MdSignalCellularAlt className="w-5 h-5" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  Screening Questions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <MdEdit size={14} /> Edit
              </button>
            </div>

            <QuestionRenderer
              questions={formData?.screeningQuestions?.screening}
              module="screening"
              readOnly={true}
              setEditingQuestionId={() => {}}
              onQuestionChange={() => {}}
              onDelete={() => {}}
            />
          </div>
        )}

        {/* Skills Section */}
        <div className="pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <MdSignalCellularAlt className="w-5 h-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Skills
              </h3>
            </div>
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <MdEdit size={14} /> Edit
            </button>
          </div>

          <div className="space-y-4">
            <QuestionRenderer
              questions={formData?.screeningQuestions?.skills}
              module="skills"
              readOnly={true}
              setEditingQuestionId={() => {}}
              onQuestionChange={() => {}}
              onDelete={() => {}}
            />

            <div className="flex flex-wrap gap-2">
              {Array.isArray(formData?.skills) && formData.skills.length > 0 ? (
                formData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-xl text-sm font-medium shadow-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No skills added</p>
              )}
            </div>
          </div>
        </div>

        {/* Attachment Section */}
        <div className="pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <MdAttachFile className="w-5 h-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Attachments
              </h3>
            </div>
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <MdEdit size={14} /> Edit
            </button>
          </div>

          <div className="space-y-3">
            <QuestionRenderer
              questions={formData?.screeningQuestions?.attachments}
              module="attachments"
              readOnly={true}
              setEditingQuestionId={() => {}}
              onQuestionChange={() => {}}
              onDelete={() => {}}
            />

            <div className="space-y-2 bg-gray-50/60 p-4 rounded-xl border border-gray-200/60 text-sm">
              {Array.isArray(formData?.attachments) && formData.attachments.length > 0 ? (
                formData.attachments.map((file, idx) => (
                  <p key={idx} className="font-semibold text-gray-800">{file.name}</p>
                ))
              ) : formData?.resume ? (
                <p className="font-semibold text-gray-800">{formData.resume.name}</p>
              ) : (
                <p className="text-gray-500">No files uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <CiFileOn className="w-5 h-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Additional Information
              </h3>
            </div>
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <MdEdit size={14} /> Edit
            </button>
          </div>

          <div className="space-y-3">
            <QuestionRenderer
              questions={formData?.screeningQuestions?.addInfo}
              module="addInfo"
              readOnly={true}
              setEditingQuestionId={() => {}}
              onQuestionChange={() => {}}
              onDelete={() => {}}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/60 p-4 rounded-xl border border-gray-200/60 text-sm">
              <div className="flex justify-between sm:justify-start gap-4">
                <span className="text-gray-500 w-48">Referral Source:</span>
                <span className="font-semibold text-gray-800">{formData?.referralSource || "-"}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4">
                <span className="text-gray-500 w-48">Subscribe Updates:</span>
                <span className="font-semibold text-gray-800">{formData?.subscribe || "-"}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4">
                <span className="text-gray-500 w-48">Consent Granted:</span>
                <span className="font-semibold text-gray-800">{formData?.consent ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4">
                <span className="text-gray-500 w-48">Terms Accepted:</span>
                <span className="font-semibold text-gray-800">{formData?.termsAccepted ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <button
            type="button"
            className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-6 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
            onClick={prevStep}
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default Review;